package com.example.tna.service;

import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import com.example.tna.dto.LoginRequestDto;
import com.example.tna.dto.UserResponse;
import com.example.tna.entity.UserEntity;
import com.example.tna.exception.BusinessException;
import com.example.tna.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    public UserResponse login(LoginRequestDto request) {
        validateLoginRequest(request);

        UserEntity user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException("E002", "メールアドレスまたはパスワード"));

        if (!user.getPassword().equals(request.getPassword())) {
            throw new BusinessException("E002", "メールアドレスまたはパスワード");
        }

        UserResponse response = new UserResponse();
        BeanUtils.copyProperties(user, response);
        return response;
    }

    private void validateLoginRequest(LoginRequestDto request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new BusinessException("E001", "メールアドレス");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new BusinessException("E001", "パスワード");
        }
        if (request.getEmail().length() > 50) {
            throw new BusinessException("E003", "メールアドレス", 50);
        }
        if (request.getPassword().length() < 8 || request.getPassword().length() > 16) {
            throw new BusinessException("E004", "パスワード", 8, 16);
        }
    }
}