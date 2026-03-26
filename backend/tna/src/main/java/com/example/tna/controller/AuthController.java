package com.example.tna.controller;

import org.springframework.web.bind.annotation.*;

import com.example.tna.dto.LoginRequestDto;
import com.example.tna.dto.UserResponse;
import com.example.tna.service.AuthService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public UserResponse login(@RequestBody LoginRequestDto request) {
        return authService.login(request);
    }
}