package com.hospital.shared.chatbot;

import java.util.List;

public record ChatbotMessageResponse(
    String answer,
    List<String> suggestions,
    String deepLink
) {}
