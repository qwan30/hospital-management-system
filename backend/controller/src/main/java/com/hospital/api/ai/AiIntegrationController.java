package com.hospital.api.ai;

import com.hospital.core.appointment.AppointmentEntity;
import com.hospital.core.appointment.AppointmentRepository;
import com.hospital.core.medicalrecord.MedicalRecordEntity;
import com.hospital.core.medicalrecord.MedicalRecordRepository;
import com.hospital.core.patient.PatientEntity;
import com.hospital.core.patient.PatientRepository;
import com.hospital.core.patientrecord.PatientRecordService;
import com.hospital.core.patientportal.PatientPortalLabResultRepository;
import com.hospital.core.patientportal.LabResultEntity;
import com.hospital.core.user.UserEntity;
import com.hospital.core.user.UserRepository;
import com.hospital.shared.api.ApiResponse;
import com.hospital.shared.enums.UserRole;
import com.hospital.shared.patientrecord.PatientRecordDetailResponse;
import com.hospital.shared.patientrecord.PatientRecordListItemResponse;

import jakarta.persistence.EntityManager;
import java.time.Instant;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai")
@PreAuthorize("@rbac.hasPermission(authentication, 'PATIENT_RECORD_READ')")
public class AiIntegrationController {

    private final PatientRepository patientRepository;
    private final PatientRecordService patientRecordService;
    private final AppointmentRepository appointmentRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final PatientPortalLabResultRepository labResultRepository;
    private final UserRepository userRepository;
    private final EntityManager entityManager;

    public AiIntegrationController(
            PatientRepository patientRepository,
            PatientRecordService patientRecordService,
            AppointmentRepository appointmentRepository,
            MedicalRecordRepository medicalRecordRepository,
            PatientPortalLabResultRepository labResultRepository,
            UserRepository userRepository,
            EntityManager entityManager) {
        this.patientRepository = patientRepository;
        this.patientRecordService = patientRecordService;
        this.appointmentRepository = appointmentRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.labResultRepository = labResultRepository;
        this.userRepository = userRepository;
        this.entityManager = entityManager;
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
            @RequestParam(required = false) String query) {
        return ApiResponse.ok(patientRecordService.search(query));
    }

    @GetMapping("/patients/{patientId}/snapshot")
    public ApiResponse<SnapshotResponse> getSnapshot(@PathVariable UUID patientId) {
        PatientRecordDetailResponse detail = patientRecordService.getDetail(patientId);
        
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
        List<LabResultEntity> labEntities = labResultRepository.findByPatientIdOrderByCollectedAtDesc(patientId);
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
    public ApiResponse<List<TimelineEvent>> getTimeline(@PathVariable UUID patientId) {
        List<TimelineEvent> events = new ArrayList<>();

        // Add appointments
        List<AppointmentEntity> appointments = appointmentRepository.findByPatientIdOrderByAppointmentDateDescFirstSlotStartTimeDesc(patientId);
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
        List<LabResultEntity> labs = labResultRepository.findByPatientIdOrderByCollectedAtDesc(patientId);
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
        return ApiResponse.ok(events);
    }

    @GetMapping("/patients/{patientId}/permissions")
    public ApiResponse<PermissionResponse> getPermissions(
            @PathVariable UUID patientId,
            @RequestParam UUID userId) {
        Optional<UserEntity> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ApiResponse.ok(new PermissionResponse(userId, patientId, false, "none", null));
        }
        UserEntity user = userOpt.get();
        if (user.getRole() == UserRole.ADMIN) {
            return ApiResponse.ok(new PermissionResponse(userId, patientId, true, "admin_role", Instant.now().plus(1, ChronoUnit.DAYS)));
        }
        boolean hasAccess = appointmentRepository.existsByDoctorIdAndPatientId(userId, patientId);
        String scopeType = hasAccess ? "treatment_relationship" : "none";
        Instant expiresAt = hasAccess ? Instant.now().plus(1, ChronoUnit.DAYS) : null;
        return ApiResponse.ok(new PermissionResponse(userId, patientId, hasAccess, scopeType, expiresAt));
    }

    @GetMapping("/changes")
    public ApiResponse<ChangesResponse> getChanges(@RequestParam(required = false) String since) {
        Instant sinceInstant = since == null ? Instant.now().minus(24, ChronoUnit.HOURS) : Instant.parse(since);
        List<ChangeItem> changes = new ArrayList<>();

        List<UUID> patientIds = entityManager.createQuery(
                "select p.id from PatientEntity p where p.updatedAt >= :since", UUID.class)
                .setParameter("since", sinceInstant)
                .getResultList();
        patientIds.forEach(id -> changes.add(new ChangeItem("patient", id, "UPDATE")));

        List<UUID> appointmentIds = entityManager.createQuery(
                "select a.id from AppointmentEntity a where a.updatedAt >= :since", UUID.class)
                .setParameter("since", sinceInstant)
                .getResultList();
        appointmentIds.forEach(id -> changes.add(new ChangeItem("appointment", id, "UPDATE")));

        List<UUID> labIds = entityManager.createQuery(
                "select l.id from PatientPortalLabResultEntity l where l.updatedAt >= :since", UUID.class)
                .setParameter("since", sinceInstant)
                .getResultList();
        labIds.forEach(id -> changes.add(new ChangeItem("lab_result", id, "UPDATE")));

        List<UUID> recordIds = entityManager.createQuery(
                "select m.id from MedicalRecordEntity m where m.updatedAt >= :since", UUID.class)
                .setParameter("since", sinceInstant)
                .getResultList();
        recordIds.forEach(id -> changes.add(new ChangeItem("medical_record", id, "UPDATE")));

        return ApiResponse.ok(new ChangesResponse(Instant.now(), changes));
    }
}
