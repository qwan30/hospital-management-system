package com.hospital.api.ai;

import com.hospital.core.ai.AiIntegrationService;
import com.hospital.core.appointment.AppointmentEntity;
import com.hospital.core.audit.AuditLogService;
import com.hospital.core.patientrecord.PatientRecordService;
import com.hospital.core.patientportal.LabResultEntity;
import com.hospital.shared.api.ApiResponse;
import com.hospital.shared.enums.UserRole;
import com.hospital.shared.patientrecord.PatientRecordDetailResponse;
import com.hospital.shared.patientrecord.PatientRecordListItemResponse;

import java.time.Instant;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai")
@PreAuthorize("@rbac.hasPermission(authentication, 'PATIENT_RECORD_READ')")
public class AiIntegrationController {

    private final PatientRecordService patientRecordService;
    private final AiIntegrationService aiIntegrationService;
    private final AuditLogService auditLogService;

    public AiIntegrationController(
            PatientRecordService patientRecordService,
            AiIntegrationService aiIntegrationService,
            AuditLogService auditLogService) {
        this.patientRecordService = patientRecordService;
        this.aiIntegrationService = aiIntegrationService;
        this.auditLogService = auditLogService;
    }

    // Inner records for response objects
    public record HealthResponse(String status, boolean hmsReachable) {}

    public record AllergyInfo(String allergen, String reaction, String severity) {}
    public record MedicationInfo(String drug, String dose, String route) {}
    public record LabInfo(String test, String value, String unit, Instant timestamp) {}

    public record SnapshotResponse(
            UUID patientId,
            String mrn,
            String name,
            String dob,
            String gender,
            List<AllergyInfo> allergies,
            List<MedicationInfo> currentMedications,
            List<LabInfo> recentLabs
    ) {}

    public record TimelineEvent(
            UUID eventId,
            String eventType,
            String title,
            String description,
            Instant timestamp
    ) {}

    public record PermissionResponse(
            UUID userId,
            UUID patientId,
            boolean hasAccess,
            String scopeType,
            Instant expiresAt
    ) {}

    public record ChangeItem(String entityType, UUID entityId, String action) {}
    public record ChangesResponse(Instant lastTimestamp, List<ChangeItem> changes) {}

    // Endpoints

    @GetMapping("/health")
    public ApiResponse<HealthResponse> getHealth() {
        return ApiResponse.ok(new HealthResponse("healthy", true));
    }

    @GetMapping("/patients")
    public ApiResponse<List<PatientRecordListItemResponse>> searchPatients(
            @RequestParam(required = false) String query,
            Authentication authentication) {
        return ApiResponse.ok(patientRecordService.search(actorId(authentication), role(authentication), query));
    }

    @GetMapping("/patients/{patientId}/snapshot")
    @Transactional(readOnly = true)
    public ApiResponse<SnapshotResponse> getSnapshot(
            @PathVariable UUID patientId,
            Authentication authentication) {
        PatientRecordDetailResponse detail = patientRecordService.getDetail(
                actorId(authentication), role(authentication), patientId);

        List<AllergyInfo> allergies = new ArrayList<>();
        if (detail.drugAllergies() != null && !detail.drugAllergies().isBlank()) {
            allergies.add(new AllergyInfo(detail.drugAllergies(), "Allergy reaction", "High"));
        }

        List<MedicationInfo> meds = new ArrayList<>();
        detail.appointments().forEach(app -> {
            if (app.medicalRecord() != null && app.medicalRecord().prescriptionItems() != null) {
                app.medicalRecord().prescriptionItems().forEach(p -> {
                    meds.add(new MedicationInfo(p.medicineName(), p.dosage(), p.instructions()));
                });
            }
        });

        List<LabInfo> labs = new ArrayList<>();
        List<LabResultEntity> labEntities = aiIntegrationService.getPatientLabs(patientId);
        labEntities.forEach(lab -> {
            labs.add(new LabInfo(lab.getTestName(), lab.getResultSummary(), "", lab.getCollectedAt()));
        });

        SnapshotResponse response = new SnapshotResponse(
                detail.patientId(),
                detail.insuranceNumber(),
                detail.fullName(),
                detail.dateOfBirth().toString(),
                detail.appointments().isEmpty() ? "Male" : "Unknown",
                allergies,
                meds,
                labs
        );
        return ApiResponse.ok(response);
    }

    @GetMapping("/patients/{patientId}/timeline")
    @Transactional(readOnly = true)
    public ApiResponse<List<TimelineEvent>> getTimeline(
            @PathVariable UUID patientId,
            Authentication authentication) {
        patientRecordService.requireReadAccess(actorId(authentication), role(authentication), patientId);
        List<TimelineEvent> events = new ArrayList<>();

        // Add appointments
        List<AppointmentEntity> appointments = aiIntegrationService.getPatientAppointments(patientId);
        appointments.forEach(app -> {
            Instant timestamp = app.getAppointmentDate()
                    .atTime(app.getFirstSlot().getStartTime())
                    .atZone(ZoneId.systemDefault())
                    .toInstant();
            events.add(new TimelineEvent(
                    app.getId(),
                    "appointment",
                    "Consultation with Dr. " + app.getDoctor().getFullName(),
                    app.getSymptoms(),
                    timestamp
            ));
        });

        // Add labs
        List<LabResultEntity> labs = aiIntegrationService.getPatientLabs(patientId);
        labs.forEach(lab -> {
            events.add(new TimelineEvent(
                    lab.getId(),
                    "lab_result",
                    lab.getTestName(),
                    lab.getResultSummary(),
                    lab.getCollectedAt()
            ));
        });

        events.sort(Comparator.comparing(TimelineEvent::timestamp).reversed());
        auditLogService.record(
                actorId(authentication),
                "PATIENT_TIMELINE_READ",
                "PATIENT_RECORD",
                patientId,
                Map.of("role", role(authentication).name()));
        return ApiResponse.ok(events);
    }

    @GetMapping("/patients/{patientId}/permissions")
    public ApiResponse<PermissionResponse> getPermissions(
            @PathVariable UUID patientId,
            @RequestParam(required = false) UUID userId,
            Authentication authentication) {
        var actorId = actorId(authentication);
        if (userId != null && !userId.equals(actorId)) {
            throw new IllegalArgumentException("Permission subject must match the authenticated actor");
        }
        var role = role(authentication);
        boolean hasAccess = patientRecordService.hasReadAccess(actorId, role, patientId);
        String scopeType = !hasAccess ? "none" : role == UserRole.ADMIN ? "admin_role" : "treatment_relationship";
        return ApiResponse.ok(new PermissionResponse(actorId, patientId, hasAccess, scopeType, null));
    }

    @GetMapping("/changes")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ChangesResponse> getChanges(
            @RequestParam(required = false) String since,
            Authentication authentication) {
        Instant sinceInstant = since == null ? Instant.now().minus(24, ChronoUnit.HOURS) : Instant.parse(since);
        List<ChangeItem> changes = new ArrayList<>();

        aiIntegrationService.getChangedPatientIds(sinceInstant)
                .forEach(id -> changes.add(new ChangeItem("patient", id, "UPDATE")));

        aiIntegrationService.getChangedAppointmentIds(sinceInstant)
                .forEach(id -> changes.add(new ChangeItem("appointment", id, "UPDATE")));

        aiIntegrationService.getChangedLabResultIds(sinceInstant)
                .forEach(id -> changes.add(new ChangeItem("lab_result", id, "UPDATE")));

        aiIntegrationService.getChangedMedicalRecordIds(sinceInstant)
                .forEach(id -> changes.add(new ChangeItem("medical_record", id, "UPDATE")));

        auditLogService.record(
                actorId(authentication),
                "PATIENT_CHANGES_READ",
                "PATIENT_RECORD",
                null,
                Map.of("since", sinceInstant.toString(), "changeCount", changes.size()));
        return ApiResponse.ok(new ChangesResponse(Instant.now(), changes));
    }

    private UUID actorId(Authentication authentication) {
        return UUID.fromString(authentication.getName());
    }

    private UserRole role(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .map(authority -> authority.getAuthority().replaceFirst("^ROLE_", ""))
                .map(UserRole::valueOf)
                .findFirst()
                .orElseThrow();
    }
}
