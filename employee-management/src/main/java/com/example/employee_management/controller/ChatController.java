package com.example.employee_management.controller;

import com.example.employee_management.dto.ChatRequest;
import com.example.employee_management.dto.ChatResponse;
import com.example.employee_management.service.ChatService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    public ChatResponse chat(@RequestBody ChatRequest request) {
        return chatService.processMessage(request);
    }
}
