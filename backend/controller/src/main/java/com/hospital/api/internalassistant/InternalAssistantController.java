package com.hospital.api.internalassistant;

import com.hospital.core.internalassistant.InternalAssistantService;
import com.hospital.shared.api.ApiResponse;
import com.hospital.shared.enums.UserRole;
import com.hospital.shared.internalassistant.InternalAssistantFeedbackRequest;
import com.hospital.shared.internalassistant.InternalAssistantFeedbackResponse;
import com.hospital.shared.internalassistant.InternalAssistantMessageRequest;
import com.hospital.shared.internalassistant.InternalAssistantMessageResponse;
import com.hospital.shared.internalassistant.InternalAssistantMode;
import com.hospital.shared.internalassistant.InternalAssistantSessionResponse;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/internal-assistant")
@PreAuthorize("hasAnyRole('DOCTOR','NURSE','ADMIN')")
public class InternalAssistantController {
  private final InternalAssistantService internalAssistantService;

  public InternalAssistantController(InternalAssistantService internalAssistantService) {
    this.internalAssistantService = internalAssistantService;
  }

  @GetMapping("/sessions/current")
  public ApiResponse<InternalAssistantSessionResponse> getCurrentSession(
      @RequestParam String mode,
      @RequestParam(required = false) UUID patientId,
      @RequestParam(required = false) UUID appointmentId,
      @RequestParam(required = false) UUID sessionId,
      Authentication authentication) {
    return ApiResponse.ok(internalAssistantService.getCurrentSession(
        UUID.fromString(authentication.getName()),
        resolveRole(authentication),
        InternalAssistantMode.fromJson(mode),
        patientId,
        appointmentId,
        sessionId));
  }

  @PostMapping("/messages")
  public ApiResponse<InternalAssistantMessageResponse> sendMessage(
      @Valid @RequestBody InternalAssistantMessageRequest request,
      Authentication authentication) {
    return ApiResponse.ok(internalAssistantService.reply(
        UUID.fromString(authentication.getName()),
        resolveRole(authentication),
        request));
  }

  @PostMapping("/messages/{messageId}/feedback")
  public ApiResponse<InternalAssistantFeedbackResponse> submitFeedback(
      @PathVariable UUID messageId,
      @Valid @RequestBody InternalAssistantFeedbackRequest request,
      Authentication authentication) {
    return ApiResponse.ok(internalAssistantService.submitFeedback(
        UUID.fromString(authentication.getName()),
        messageId,
        request));
  }

  private UserRole resolveRole(Authentication authentication) {
    return authentication.getAuthorities().stream()
        .findFirst()
        .map(authority -> authority.getAuthority().replace("ROLE_", ""))
        .map(UserRole::valueOf)
        .orElseThrow(() -> new IllegalStateException("Authenticated role is required"));
  }
}
