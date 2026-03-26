package com.example.tna.controller;

import com.example.tna.dto.LoginRequestDto;
import com.example.tna.dto.LoginResponseDto;
import com.example.tna.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public LoginResponseDto login(@RequestBody LoginRequestDto requestDto) {
        return authService.login(requestDto);
    }
}