package com.hospital.api.medicalrecord;

import com.hospital.core.medicalrecord.MedicalRecordService;
import com.hospital.shared.api.ApiResponse;
import com.hospital.shared.medicalrecord.MedicalRecordCreateRequest;
import com.hospital.shared.medicalrecord.MedicalRecordResponse;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/medical-records")
public class MedicalRecordController {
  private final MedicalRecordService medicalRecordService;

  public MedicalRecordController(MedicalRecordService medicalRecordService) {
    this.medicalRecordService = medicalRecordService;
  }

  @PostMapping
  @PreAuthorize("hasRole('DOCTOR')")
  public ResponseEntity<ApiResponse<MedicalRecordResponse>> createMedicalRecord(
      @Valid @RequestBody MedicalRecordCreateRequest request,
      Authentication authentication) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiResponse.ok(medicalRecordService.createMedicalRecord(
            UUID.fromString(authentication.getName()),
            request)));
  }

  @PostMapping(value = "/preview.pdf", produces = MediaType.APPLICATION_PDF_VALUE)
  @PreAuthorize("hasRole('DOCTOR')")
  public ResponseEntity<byte[]> previewPrescriptionPdf(
      @Valid @RequestBody MedicalRecordCreateRequest request,
      Authentication authentication) {
    var document = medicalRecordService.previewPrescriptionPdf(
        UUID.fromString(authentication.getName()),
        request);

    return ResponseEntity.ok()
        .contentType(MediaType.APPLICATION_PDF)
        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + document.fileName() + "\"")
        .body(document.content());
  }

  @GetMapping(value = "/{recordId}/prescription.pdf", produces = MediaType.APPLICATION_PDF_VALUE)
  @PreAuthorize("hasRole('DOCTOR')")
  public ResponseEntity<byte[]> downloadPrescriptionPdf(
      @PathVariable UUID recordId,
      Authentication authentication) {
    var document = medicalRecordService.generatePrescriptionPdf(
        UUID.fromString(authentication.getName()),
        recordId);

    return ResponseEntity.ok()
        .contentType(MediaType.APPLICATION_PDF)
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + document.fileName() + "\"")
        .body(document.content());
  }
}
