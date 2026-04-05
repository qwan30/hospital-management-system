package com.hospital.core.prescription;

public record PrescriptionPdfDocument(
    String fileName,
    byte[] content
) {}
