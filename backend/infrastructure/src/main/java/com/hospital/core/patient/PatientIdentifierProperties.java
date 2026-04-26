package com.hospital.core.patient;

import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "security.patient-identifier")
public record PatientIdentifierProperties(@NotBlank String secret) {}
