package com.hospital.shared.chatbot;

import jakarta.validation.constraints.NotBlank;

public record ChatbotMessageRequest(@NotBlank String message) {}
