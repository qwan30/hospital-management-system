package com.hospital.api.auth;

import com.hospital.core.user.UserRepository;
import com.hospital.shared.auth.LoginRequest;
import com.hospital.shared.auth.LoginResponse;
import com.hospital.shared.auth.TokenPair;
import java.util.UUID;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtTokenService jwtTokenService;

  public AuthService(
      UserRepository userRepository,
      PasswordEncoder passwordEncoder,
      JwtTokenService jwtTokenService) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtTokenService = jwtTokenService;
  }

  public LoginResponse login(LoginRequest request) {
    var user = userRepository.findByEmailIgnoreCaseAndActiveTrue(request.email())
        .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

    if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
      throw new BadCredentialsException("Invalid email or password");
    }

    return toLoginResponse(user);
  }

  public TokenPair refresh(String refreshToken) {
    if (refreshToken == null || refreshToken.isBlank()) {
      throw new BadCredentialsException("Invalid refresh token");
    }

    var claims = jwtTokenService.parseClaims(refreshToken);
    if (!"refresh".equals(claims.get("type", String.class))) {
      throw new BadCredentialsException("Invalid refresh token");
    }
    var scope = claims.get("scope", String.class);
    if (scope != null && !"staff".equals(scope)) {
      throw new BadCredentialsException("Invalid refresh token");
    }

    var user = userRepository.findById(UUID.fromString(claims.getSubject()))
        .orElseThrow(() -> new BadCredentialsException("User not found"));

    var accessToken = jwtTokenService.generateAccessToken(user);
    var nextRefreshToken = jwtTokenService.generateRefreshToken(user.getId(), "staff");
    return new TokenPair(accessToken, nextRefreshToken, jwtTokenService.accessTokenExpirationSeconds());
  }

  private LoginResponse toLoginResponse(com.hospital.core.user.UserEntity user) {
    var accessToken = jwtTokenService.generateAccessToken(user);
    var refreshToken = jwtTokenService.generateRefreshToken(user.getId(), "staff");
    return new LoginResponse(
        user.getId(),
        user.getFullName(),
        user.getRole(),
        new TokenPair(accessToken, refreshToken, jwtTokenService.accessTokenExpirationSeconds()));
  }
}
