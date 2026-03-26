package com.example.tna.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.tna.dto.RegisterRequestDto;
import com.example.tna.dto.UserResponse;
import com.example.tna.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public UserResponse register(@RequestBody RegisterRequestDto request) {
        return userService.register(request);
    }

    @GetMapping("/{yearMonth}")
    public ResponseEntity<List<UserResponse>> getUserList(@PathVariable Integer yearMonth) {
        List<UserResponse> userResult = userService.getUserList(yearMonth);
        return ResponseEntity.ok(userResult);
    }
}