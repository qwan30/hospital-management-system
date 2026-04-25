package com.hospital.api.chatbot;

import com.hospital.core.chatbot.ChatbotService;
import com.hospital.shared.api.ApiResponse;
import com.hospital.shared.chatbot.ChatbotMessageRequest;
import com.hospital.shared.chatbot.ChatbotMessageResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/chatbot")
public class ChatbotController {
  private final ChatbotService chatbotService;

  public ChatbotController(ChatbotService chatbotService) {
    this.chatbotService = chatbotService;
  }

  @PostMapping("/messages")
  public ApiResponse<ChatbotMessageResponse> sendMessage(@Valid @RequestBody ChatbotMessageRequest request) {
    return ApiResponse.ok(chatbotService.reply(request.message()));
  }
}
