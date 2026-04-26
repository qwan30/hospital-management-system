package com.hospital.api.patientauth;

import com.hospital.api.auth.JwtTokenService;
import com.hospital.core.patient.PatientIdentifierProtector;
import com.hospital.core.patient.PatientRepository;
import com.hospital.core.patientauth.PatientAccountEntity;
import com.hospital.core.patientauth.PatientAccountRepository;
import com.hospital.shared.auth.LoginRequest;
import com.hospital.shared.auth.TokenPair;
import com.hospital.shared.patientauth.PatientAuthLoginResponse;
import com.hospital.shared.patientauth.PatientClaimRequest;
import java.time.LocalDate;
import java.util.UUID;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PatientAuthService {
  private final JwtTokenService jwtTokenService;
  private final PasswordEncoder passwordEncoder;
  private final PatientAccountRepository patientAccountRepository;
  private final PatientIdentifierProtector patientIdentifierProtector;
  private final PatientRepository patientRepository;

  public PatientAuthService(
      JwtTokenService jwtTokenService,
      PasswordEncoder passwordEncoder,
      PatientAccountRepository patientAccountRepository,
      PatientIdentifierProtector patientIdentifierProtector,
      PatientRepository patientRepository) {
    this.jwtTokenService = jwtTokenService;
    this.passwordEncoder = passwordEncoder;
    this.patientAccountRepository = patientAccountRepository;
    this.patientIdentifierProtector = patientIdentifierProtector;
    this.patientRepository = patientRepository;
  }

  @Transactional
  public PatientAuthLoginResponse claim(PatientClaimRequest request) {
    var patient = patientRepository.findFirstByEmailIgnoreCaseAndDateOfBirth(
            request.email().trim().toLowerCase(),
            LocalDate.parse(request.dateOfBirth()))
        .orElseThrow(() -> new BadCredentialsException("Patient identity could not be verified"));

    var normalizedName = request.fullName().trim().replaceAll("\\s+", " ");
    if (!patient.getFullName().equalsIgnoreCase(normalizedName)) {
      throw new BadCredentialsException("Patient identity could not be verified");
    }
    if (!patientIdentifierProtector.hash(request.cccd()).equals(patient.getCccdHash())) {
      throw new BadCredentialsException("Patient identity could not be verified");
    }

    var account = patientAccountRepository.findByPatientIdAndActiveTrue(patient.getId())
        .orElseGet(PatientAccountEntity::new);
    account.setPatient(patient);
    account.setEmail(request.email().trim().toLowerCase());
    account.setPasswordHash(passwordEncoder.encode(request.password()));
    account.setActive(true);
    patientAccountRepository.save(account);

    return toLoginResponse(account);
  }

  @Transactional(readOnly = true)
  public PatientAuthLoginResponse login(LoginRequest request) {
    var account = patientAccountRepository.findByEmailIgnoreCaseAndActiveTrue(request.email())
        .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

    if (!passwordEncoder.matches(request.password(), account.getPasswordHash())) {
      throw new BadCredentialsException("Invalid email or password");
    }

    return toLoginResponse(account);
  }

  @Transactional(readOnly = true)
  public TokenPair refresh(String refreshToken) {
    if (refreshToken == null || refreshToken.isBlank()) {
      throw new BadCredentialsException("Invalid refresh token");
    }

    var claims = jwtTokenService.parseClaims(refreshToken);
    if (!"refresh".equals(claims.get("type", String.class))) {
      throw new BadCredentialsException("Invalid refresh token");
    }
    if (!"patient".equals(claims.get("scope", String.class))) {
      throw new BadCredentialsException("Invalid refresh token");
    }

    var account = patientAccountRepository.findByPatientIdAndActiveTrue(UUID.fromString(claims.getSubject()))
        .orElseThrow(() -> new BadCredentialsException("Patient account not found"));
    var accessToken = jwtTokenService.generateAccessToken(
        account.getPatientId(),
        account.getPatient().getFullName(),
        "PATIENT");
    var nextRefreshToken = jwtTokenService.generateRefreshToken(account.getPatientId(), "patient");
    return new TokenPair(accessToken, nextRefreshToken, jwtTokenService.accessTokenExpirationSeconds());
  }

  private PatientAuthLoginResponse toLoginResponse(PatientAccountEntity account) {
    var accessToken = jwtTokenService.generateAccessToken(
        account.getPatientId(),
        account.getPatient().getFullName(),
        "PATIENT");
    var refreshToken = jwtTokenService.generateRefreshToken(account.getPatientId(), "patient");
    return new PatientAuthLoginResponse(
        account.getPatientId(),
        account.getPatient().getFullName(),
        "PATIENT",
        new TokenPair(accessToken, refreshToken, jwtTokenService.accessTokenExpirationSeconds()));
  }
}
