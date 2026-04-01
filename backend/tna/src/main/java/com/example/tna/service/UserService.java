package com.example.tna.service;

import com.example.tna.dto.RegisterRequestDto;
import com.example.tna.dto.RegisterResponseDto;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.tna.dto.UserResponse;
import com.example.tna.entity.UserEntity;
import com.example.tna.exception.BusinessException;
import com.example.tna.repository.AttendanceRepository;
import com.example.tna.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;



@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final AttendanceRepository attendanceRepository;

    public RegisterResponseDto register(RegisterRequestDto requestDto) {
        validate(requestDto);

        if (userRepository.existsByEmail(requestDto.getEmail())) {
            throw new BusinessException("E005", "メールアドレス");
        }

        UserEntity entity = new UserEntity();
        entity.setName(requestDto.getName());
        entity.setEmail(requestDto.getEmail());
        entity.setPassword(requestDto.getPassword());
        entity.setCreatedAt(LocalDateTime.now());
        entity.setCreatedBy("system");
        entity.setUpdatedAt(LocalDateTime.now());
        entity.setUpdatedBy("system");

        UserEntity saved = userRepository.save(entity);

        RegisterResponseDto response = new RegisterResponseDto();
        response.setId(saved.getId());
        response.setName(saved.getName());
        response.setEmail(saved.getEmail());

        return response;
    }

    private void validate(RegisterRequestDto requestDto) {
        if (requestDto == null) {
            throw new BusinessException("E001", "ユーザ情報");
        }

        if (requestDto.getName() == null || requestDto.getName().isBlank()) {
            throw new BusinessException("E001", "ユーザ名");
        }

        if (requestDto.getName().length() > 50) {
            throw new BusinessException("E003", "ユーザ名", 50);
        }

        if (!requestDto.getName().matches("^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uFF01-\uFF60]+$")) {
            throw new BusinessException("E002", "ユーザ名");
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

        if (!isValidPassword(requestDto.getPassword())) {
            throw new BusinessException("E002", "パスワード");
        }
    }

    private boolean isValidPassword(String value) {
        boolean hasLetter = value.matches(".*[A-Za-z].*");
        boolean hasNumber = value.matches(".*[0-9].*");
        boolean hasSymbol = value.matches(".*[^A-Za-z0-9].*");

        int typeCount = 0;
        if (hasLetter) typeCount++;
        if (hasNumber) typeCount++;
        if (hasSymbol) typeCount++;

        return typeCount >= 2;
    }



    public List<UserResponse> getUserList(Integer yearMonth) {
        int year = yearMonth / 100;
        int month = yearMonth % 100;
        LocalDate fromDate = LocalDate.of(year, month, 1);
        LocalDate toDate = fromDate.withDayOfMonth(fromDate.lengthOfMonth());

        // SQLで集計取得
        return attendanceRepository.findSummaryByMonth(fromDate, toDate);

    }
}
