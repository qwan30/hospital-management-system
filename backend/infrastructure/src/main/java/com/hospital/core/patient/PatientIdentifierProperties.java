package com.hospital.core.patient;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "security.patient-identifier")
public record PatientIdentifierProperties(String secret) {}
