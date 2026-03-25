package com.example.tna.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import com.example.tna.dto.UserResponse;
import com.example.tna.entity.UserEntity;
import com.example.tna.repository.UserRepository;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
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
}
