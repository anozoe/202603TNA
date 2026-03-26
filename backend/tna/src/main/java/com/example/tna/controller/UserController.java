package com.example.tna.controller;

import com.example.tna.dto.PageResponseDto;
import com.example.tna.dto.UserResponse;
import com.example.tna.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private final UserService userService;

    @GetMapping("/{yearMonth}")
    public PageResponseDto<UserResponse> getUserList(
            @PathVariable Integer yearMonth,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {
        return userService.getUserList(yearMonth, page, size);
    }
}