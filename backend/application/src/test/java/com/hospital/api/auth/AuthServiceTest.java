package com.hospital.api.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.hospital.core.user.UserEntity;
import com.hospital.core.user.UserRepository;
import com.hospital.shared.auth.TokenPair;
import io.jsonwebtoken.Claims;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

  @Mock private UserRepository userRepository;
  @Mock private PasswordEncoder passwordEncoder;
  @Mock private JwtTokenService jwtTokenService;
  @Mock private Claims claims;

  @InjectMocks private AuthService authService;

  @Test
  void refreshRejectsInactiveUserBeforeGeneratingTokens() {
    var userId = UUID.randomUUID();

    when(jwtTokenService.parseClaims("valid-refresh-token")).thenReturn(claims);
    when(claims.get("type", String.class)).thenReturn("refresh");
    when(claims.get("scope", String.class)).thenReturn("staff");
    when(claims.getSubject()).thenReturn(userId.toString());
    when(userRepository.findActiveByIdForRefresh(userId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> authService.refresh("valid-refresh-token"))
        .isInstanceOf(BadCredentialsException.class)
        .hasMessage("Invalid refresh token");

    verify(jwtTokenService, never()).generateAccessToken(any(UserEntity.class));
    verify(jwtTokenService, never()).generateRefreshToken(any(UUID.class), any(String.class));
  }

  @Test
  void refreshRejectsMissingUserBeforeGeneratingTokens() {
    var userId = UUID.randomUUID();
    stubValidStaffRefreshToken(userId);
    when(userRepository.findActiveByIdForRefresh(userId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> authService.refresh("valid-refresh-token"))
        .isInstanceOf(BadCredentialsException.class)
        .hasMessage("Invalid refresh token");

    verify(jwtTokenService, never()).generateAccessToken(any(UserEntity.class));
    verify(jwtTokenService, never()).generateRefreshToken(any(UUID.class), any(String.class));
  }

  @Test
  void refreshReturnsGeneratedTokensForActiveUser() {
    var userId = UUID.randomUUID();
    var activeUser = new UserEntity();
    activeUser.setId(userId);
    activeUser.setActive(true);
    stubValidStaffRefreshToken(userId);
    when(userRepository.findActiveByIdForRefresh(userId)).thenReturn(Optional.of(activeUser));
    when(jwtTokenService.generateAccessToken(activeUser)).thenReturn("next-access-token");
    when(jwtTokenService.generateRefreshToken(userId, "staff")).thenReturn("next-refresh-token");
    when(jwtTokenService.accessTokenExpirationSeconds()).thenReturn(3600L);

    var result = authService.refresh("valid-refresh-token");

    assertThat(result).isEqualTo(new TokenPair("next-access-token", "next-refresh-token", 3600L));
  }

  private void stubValidStaffRefreshToken(UUID userId) {
    when(jwtTokenService.parseClaims("valid-refresh-token")).thenReturn(claims);
    when(claims.get("type", String.class)).thenReturn("refresh");
    when(claims.get("scope", String.class)).thenReturn("staff");
    when(claims.getSubject()).thenReturn(userId.toString());
  }
}
