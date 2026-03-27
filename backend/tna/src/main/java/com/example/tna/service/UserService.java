package com.example.tna.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.tna.dto.UserResponse;
import com.example.tna.entity.UserEntity;
import com.example.tna.exception.BusinessException;
import com.example.tna.repository.AttendanceRepository;
import com.example.tna.repository.UserRepository;

import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class UserService {

    public UserService(AttendanceRepository attendanceRepository) {;
        this.attendanceRepository = attendanceRepository;
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
