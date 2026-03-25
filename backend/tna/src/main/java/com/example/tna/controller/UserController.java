package com.example.tna.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.tna.dto.UserResponse;
import com.example.tna.service.UserService;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;


@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService; 
    }

    @GetMapping("/{yearMonth}")
    public ResponseEntity<List<UserResponse>> getUserList(@PathVariable Integer yearMonth) {
        List<UserResponse> userResult = userService.getUserList(yearMonth);
        return ResponseEntity.ok(userResult);
    }
    
}
