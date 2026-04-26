package com.hospital.core.security;

import com.hospital.shared.enums.UserRole;
import java.util.Map;
import java.util.Set;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service("rbac")
public class RbacAuthorizationService {
  private static final Map<String, Set<UserRole>> PERMISSIONS = Map.ofEntries(
      entry("ADMIN_USERS_MANAGE", UserRole.ADMIN),
      entry("ADMIN_DEPARTMENTS_MANAGE", UserRole.ADMIN),
      entry("ADMIN_ROOMS_MANAGE", UserRole.ADMIN),
      entry("ADMIN_SCHEDULE_MANAGE", UserRole.ADMIN),
      entry("ADMIN_CONTENT_MANAGE", UserRole.ADMIN),
      entry("ADMIN_MONITORING_READ", UserRole.ADMIN),
      entry("ADMIN_STATS_READ", UserRole.ADMIN),
      entry("AUDIT_LOG_READ", UserRole.ADMIN, UserRole.ACCOUNTANT),

      entry("QUEUE_READ", UserRole.ADMIN, UserRole.NURSE, UserRole.RECEPTIONIST),
      entry("QUEUE_CHECK_IN", UserRole.ADMIN, UserRole.NURSE, UserRole.RECEPTIONIST),
      entry("APPOINTMENT_READ", UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST),
      entry("APPOINTMENT_WRITE", UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST),
      entry("APPOINTMENT_CANCEL", UserRole.ADMIN, UserRole.NURSE, UserRole.RECEPTIONIST),
      entry("APPOINTMENT_STATUS_WRITE", UserRole.DOCTOR),
      entry("FOLLOW_UP_READ", UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE),
      entry("FOLLOW_UP_WRITE", UserRole.DOCTOR),
      entry("SCHEDULE_READ", UserRole.DOCTOR),

      entry("PATIENT_RECORD_READ", UserRole.ADMIN, UserRole.DOCTOR),
      entry("PATIENT_HISTORY_READ", UserRole.DOCTOR),
      entry("MEDICAL_RECORD_WRITE", UserRole.ADMIN, UserRole.DOCTOR),
      entry("PRESCRIPTION_READ", UserRole.ADMIN, UserRole.DOCTOR, UserRole.PHARMACIST),
      entry("LAB_RESULT_READ", UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE),
      entry("LAB_RESULT_WRITE", UserRole.ADMIN, UserRole.DOCTOR),
      entry("VITAL_SIGNS_READ", UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE),
      entry("VITAL_SIGNS_WRITE", UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE),

      entry("INVOICE_READ", UserRole.ADMIN, UserRole.ACCOUNTANT),
      entry("INVOICE_WRITE", UserRole.ADMIN, UserRole.ACCOUNTANT),
      entry("PRICING_MANAGE", UserRole.ADMIN, UserRole.ACCOUNTANT),
      entry("REVENUE_READ", UserRole.ADMIN, UserRole.ACCOUNTANT),
      entry("INVENTORY_READ", UserRole.ADMIN, UserRole.PHARMACIST),
      entry("INVENTORY_MANAGE", UserRole.ADMIN, UserRole.PHARMACIST),

      entry("PATIENT_PORTAL_READ", UserRole.PATIENT),
      entry("PATIENT_PORTAL_WRITE", UserRole.PATIENT));

  public boolean hasPermission(Authentication authentication, String permission) {
    if (authentication == null || !authentication.isAuthenticated() || permission == null) {
      return false;
    }

    var allowedRoles = PERMISSIONS.get(permission);
    if (allowedRoles == null || allowedRoles.isEmpty()) {
      return false;
    }

    return authentication.getAuthorities().stream()
        .map(authority -> authority.getAuthority().replaceFirst("^ROLE_", ""))
        .map(this::toRole)
        .anyMatch(role -> role != null && allowedRoles.contains(role));
  }

  private UserRole toRole(String value) {
    try {
      return UserRole.valueOf(value);
    } catch (IllegalArgumentException exception) {
      return null;
    }
  }

  private static Map.Entry<String, Set<UserRole>> entry(String permission, UserRole... roles) {
    return Map.entry(permission, Set.of(roles));
  }
}
