package com.example.tna.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import com.example.tna.dto.RegisterRequestDto;
import com.example.tna.dto.UserResponse;
import com.example.tna.entity.UserEntity;
import com.example.tna.exception.BusinessException;
import com.example.tna.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserResponse register(RegisterRequestDto request) {
        validateRegisterRequest(request);

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("E005", "メールアドレス");
        }

        UserEntity entity = new UserEntity();
        entity.setName(request.getName());
        entity.setEmail(request.getEmail());
        entity.setPassword(request.getPassword());
        entity.setCreatedAt(LocalDateTime.now());
        entity.setCreatedBy("system");
        entity.setUpdatedAt(LocalDateTime.now());
        entity.setUpdatedBy("system");

        UserEntity saved = userRepository.save(entity);

        UserResponse response = new UserResponse();
        BeanUtils.copyProperties(saved, response);
        return response;
    }

    public List<UserResponse> getUserList(Integer yearMonth) {
        List<UserEntity> entities = userRepository.findAll();
        List<UserResponse> userResponseList = new ArrayList<>();

        for (UserEntity entity : entities) {
            UserResponse response = new UserResponse();
            BeanUtils.copyProperties(entity, response);
            userResponseList.add(response);
        }

        return userResponseList;
    }

    private void validateRegisterRequest(RegisterRequestDto request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new BusinessException("E001", "ユーザ名");
        }
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new BusinessException("E001", "メールアドレス");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new BusinessException("E001", "パスワード");
        }

        if (request.getName().length() > 50) {
            throw new BusinessException("E003", "ユーザ名", 50);
        }
        if (request.getEmail().length() > 50) {
            throw new BusinessException("E003", "メールアドレス", 50);
        }
        if (request.getPassword().length() < 8 || request.getPassword().length() > 16) {
            throw new BusinessException("E004", "パスワード", 8, 16);
        }
    }
}