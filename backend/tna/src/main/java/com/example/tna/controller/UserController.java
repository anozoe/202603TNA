package com.example.tna.controller;

import com.example.tna.dto.RegisterRequestDto;
import com.example.tna.dto.UserResponse;
import com.example.tna.entity.UserEntity;
import com.example.tna.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private final UserService userService;

    @GetMapping("/{yearMonth}")
    public ResponseEntity<List<UserEntity>> getUserList(@PathVariable Integer yearMonth) {
        List<UserEntity> userResult = userService.getUserList(yearMonth);
        return ResponseEntity.ok(userResult);
    }

    @PostMapping("/register")
    public UserResponse register(@RequestBody RegisterRequestDto requestDto) {
        return userService.register(requestDto);
    }
}