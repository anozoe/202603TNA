package com.example.tna.service;

import java.time.LocalDate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.tna.dto.PageResponseDto;
import com.example.tna.dto.UserResponse;
import com.example.tna.repository.AttendanceRepository;

@Service
public class UserService {
    private final AttendanceRepository attendanceRepository;

    public UserService(AttendanceRepository attendanceRepository) {
        this.attendanceRepository = attendanceRepository;
    }

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
}