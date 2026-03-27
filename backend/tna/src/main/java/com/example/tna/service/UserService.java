package com.example.tna.service;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.beans.BeanUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.tna.dto.PageResponseDto;
import com.example.tna.dto.RegisterRequestDto;
import com.example.tna.dto.UserResponse;
import com.example.tna.entity.UserEntity;
import com.example.tna.exception.BusinessException;
import com.example.tna.repository.AttendanceRepository;
import com.example.tna.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;

    public PageResponseDto<UserResponse> getUserList(Integer yearMonth, Integer page, Integer size) {
        int year = yearMonth / 100;
        int month = yearMonth % 100;
        LocalDate fromDate = LocalDate.of(year, month, 1);
        LocalDate toDate = fromDate.withDayOfMonth(fromDate.lengthOfMonth());

        Pageable pageable = PageRequest.of(page, size);
        Page<UserResponse> resultPage =
                attendanceRepository.findSummaryByMonth(fromDate, toDate, pageable);

        return new PageResponseDto<>(
                resultPage.getContent(),
                resultPage.getNumber(),
                resultPage.getSize(),
                resultPage.getTotalElements(),
                resultPage.getTotalPages()
        );
    }

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

    private void validateRegisterRequest(RegisterRequestDto request) {
        if (request == null) {
            throw new BusinessException("E009");
        }

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