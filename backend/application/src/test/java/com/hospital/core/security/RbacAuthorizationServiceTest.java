package com.hospital.core.security;

import static org.assertj.core.api.Assertions.assertThat;

import com.hospital.shared.enums.UserRole;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

class RbacAuthorizationServiceTest {
  private final RbacAuthorizationService service = new RbacAuthorizationService();

  @Test
  void exposesSevenRoleCatalog() {
    assertThat(UserRole.values())
        .containsExactlyInAnyOrder(
            UserRole.ADMIN,
            UserRole.DOCTOR,
            UserRole.NURSE,
            UserRole.RECEPTIONIST,
            UserRole.PHARMACIST,
            UserRole.ACCOUNTANT,
            UserRole.PATIENT);
  }

  @Test
  void grantsAdministrativePermissionsOnlyToAdmin() {
    assertThat(service.hasPermission(auth(UserRole.ADMIN), "ADMIN_USERS_MANAGE")).isTrue();

    assertThat(service.hasPermission(auth(UserRole.DOCTOR), "ADMIN_USERS_MANAGE")).isFalse();
    assertThat(service.hasPermission(auth(UserRole.NURSE), "ADMIN_USERS_MANAGE")).isFalse();
    assertThat(service.hasPermission(auth(UserRole.RECEPTIONIST), "ADMIN_USERS_MANAGE")).isFalse();
    assertThat(service.hasPermission(auth(UserRole.PHARMACIST), "ADMIN_USERS_MANAGE")).isFalse();
    assertThat(service.hasPermission(auth(UserRole.ACCOUNTANT), "ADMIN_USERS_MANAGE")).isFalse();
    assertThat(service.hasPermission(auth(UserRole.PATIENT), "ADMIN_USERS_MANAGE")).isFalse();
  }

  @Test
  void separatesClinicalReceptionPharmacyBillingAndPatientPermissions() {
    assertAllowed("QUEUE_CHECK_IN", UserRole.ADMIN, UserRole.NURSE, UserRole.RECEPTIONIST);
    assertDenied("QUEUE_CHECK_IN", UserRole.DOCTOR, UserRole.PHARMACIST, UserRole.ACCOUNTANT, UserRole.PATIENT);

    assertAllowed("MEDICAL_RECORD_WRITE", UserRole.ADMIN, UserRole.DOCTOR);
    assertDenied("MEDICAL_RECORD_WRITE", UserRole.NURSE, UserRole.RECEPTIONIST, UserRole.PHARMACIST, UserRole.ACCOUNTANT, UserRole.PATIENT);

    assertAllowed("INVENTORY_MANAGE", UserRole.ADMIN, UserRole.PHARMACIST);
    assertDenied("INVENTORY_MANAGE", UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST, UserRole.ACCOUNTANT, UserRole.PATIENT);

    assertAllowed("INVOICE_READ", UserRole.ADMIN, UserRole.ACCOUNTANT);
    assertDenied("INVOICE_READ", UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST, UserRole.PHARMACIST, UserRole.PATIENT);

    assertAllowed("PATIENT_PORTAL_READ", UserRole.PATIENT);
    assertDenied("PATIENT_PORTAL_READ", UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST, UserRole.PHARMACIST, UserRole.ACCOUNTANT);
  }

  @Test
  void deniesUnknownPermissionAndUnauthenticatedRequests() {
    assertThat(service.hasPermission(auth(UserRole.ADMIN), "UNKNOWN_PERMISSION")).isFalse();
    assertThat(service.hasPermission(null, "ADMIN_USERS_MANAGE")).isFalse();
  }

  private void assertAllowed(String permission, UserRole... roles) {
    for (var role : roles) {
      assertThat(service.hasPermission(auth(role), permission))
          .as("%s should be allowed for %s", permission, role)
          .isTrue();
    }
  }

  private void assertDenied(String permission, UserRole... roles) {
    for (var role : roles) {
      assertThat(service.hasPermission(auth(role), permission))
          .as("%s should be denied for %s", permission, role)
          .isFalse();
    }
  }

  private UsernamePasswordAuthenticationToken auth(UserRole role) {
    return new UsernamePasswordAuthenticationToken(
        "actor-id",
        "token",
        List.of(new SimpleGrantedAuthority("ROLE_" + role.name())));
  }
}
