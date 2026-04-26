package com.hospital.core.patient;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.stereotype.Component;

@Component
public class PatientIdentifierProtector {
  private static final String PREFIX = "enc:";
  private static final int GCM_TAG_LENGTH = 128;
  private static final int IV_LENGTH = 12;

  private final PatientIdentifierProperties properties;
  private final SecureRandom secureRandom = new SecureRandom();

  public PatientIdentifierProtector(PatientIdentifierProperties properties) {
    this.properties = properties;
  }

  public String encrypt(String plainValue) {
    if (plainValue == null || plainValue.isBlank()) {
      return plainValue;
    }
    if (isEncrypted(plainValue)) {
      return plainValue;
    }

    try {
      var iv = new byte[IV_LENGTH];
      secureRandom.nextBytes(iv);
      var cipher = Cipher.getInstance("AES/GCM/NoPadding");
      cipher.init(Cipher.ENCRYPT_MODE, key(), new GCMParameterSpec(GCM_TAG_LENGTH, iv));
      var encrypted = cipher.doFinal(plainValue.getBytes(StandardCharsets.UTF_8));
      var payload = ByteBuffer.allocate(iv.length + encrypted.length).put(iv).put(encrypted).array();
      return PREFIX + Base64.getUrlEncoder().withoutPadding().encodeToString(payload);
    } catch (Exception exception) {
      throw new IllegalStateException("Failed to encrypt patient identifier", exception);
    }
  }

  public String decrypt(String encryptedValue) {
    if (encryptedValue == null || encryptedValue.isBlank()) {
      return encryptedValue;
    }
    if (!isEncrypted(encryptedValue)) {
      return encryptedValue;
    }

    try {
      var payload = decodePayload(encryptedValue.substring(PREFIX.length()));
      var buffer = ByteBuffer.wrap(payload);
      var iv = new byte[IV_LENGTH];
      buffer.get(iv);
      var encrypted = new byte[buffer.remaining()];
      buffer.get(encrypted);
      var cipher = Cipher.getInstance("AES/GCM/NoPadding");
      cipher.init(Cipher.DECRYPT_MODE, key(), new GCMParameterSpec(GCM_TAG_LENGTH, iv));
      return new String(cipher.doFinal(encrypted), StandardCharsets.UTF_8);
    } catch (Exception exception) {
      throw new IllegalStateException("Failed to decrypt patient identifier", exception);
    }
  }

  public String hash(String plainValue) {
    if (plainValue == null || plainValue.isBlank()) {
      return null;
    }

    return toHex(sha256(plainValue.getBytes(StandardCharsets.UTF_8)));
  }

  public boolean isEncrypted(String value) {
    return value != null && value.startsWith(PREFIX);
  }

  private SecretKeySpec key() {
    var secret = properties.secret();
    if (secret == null || secret.isBlank()) {
      throw new IllegalStateException("Patient identifier secret is not configured");
    }

    return new SecretKeySpec(sha256(secret.getBytes(StandardCharsets.UTF_8)), "AES");
  }

  private byte[] decodePayload(String encodedPayload) {
    try {
      return Base64.getUrlDecoder().decode(encodedPayload);
    } catch (IllegalArgumentException exception) {
      return Base64.getDecoder().decode(encodedPayload);
    }
  }

  private byte[] sha256(byte[] input) {
    try {
      return MessageDigest.getInstance("SHA-256").digest(input);
    } catch (NoSuchAlgorithmException exception) {
      throw new IllegalStateException("SHA-256 is not available", exception);
    }
  }

  private String toHex(byte[] input) {
    var builder = new StringBuilder(input.length * 2);
    for (byte current : input) {
      builder.append(String.format("%02x", current));
    }
    return builder.toString();
  }
}
