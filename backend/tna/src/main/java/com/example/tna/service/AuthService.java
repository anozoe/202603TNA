package com.example.tna.service;

import org.springframework.stereotype.Service;

import com.example.tna.dto.LoginRequestDto;
import com.example.tna.dto.LoginResponseDto;
import com.example.tna.entity.UserEntity;
import com.example.tna.exception.BusinessException;
import com.example.tna.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    public LoginResponseDto login(LoginRequestDto requestDto) {
        validate(requestDto);

        UserEntity user = userRepository
                .findByEmailAndPassword(requestDto.getEmail(), requestDto.getPassword())
                .orElseThrow(() -> new BusinessException("E008", "メールアドレス", "パスワード"));

        LoginResponseDto responseDto = new LoginResponseDto();
        responseDto.setId(user.getId());
        responseDto.setName(user.getName());
        responseDto.setEmail(user.getEmail());

        return responseDto;
    }

    private void validate(LoginRequestDto requestDto) {
        if (requestDto == null) {
            throw new BusinessException("E001", "ログイン情報");
        }

        if (requestDto.getEmail() == null || requestDto.getEmail().isBlank()) {
            throw new BusinessException("E001", "メールアドレス");
        }

        if (!requestDto.getEmail().matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            throw new BusinessException("E002", "メールアドレス");
        }

        if (requestDto.getEmail().length() > 50) {
            throw new BusinessException("E003", "メールアドレス", 50);
        }

        if (requestDto.getPassword() == null || requestDto.getPassword().isBlank()) {
            throw new BusinessException("E001", "パスワード");
        }

        if (requestDto.getPassword().length() < 8 || requestDto.getPassword().length() > 16) {
            throw new BusinessException("E004", "パスワード", 8, 16);
        }
    }
}