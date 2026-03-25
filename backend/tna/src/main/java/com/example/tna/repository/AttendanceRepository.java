package com.example.tna.repository;

import com.example.tna.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Integer> {

    List<Attendance> findByUserIdAndWorkDateBetweenOrderByWorkDateAsc(
            Integer userId,
            LocalDate fromDate,
            LocalDate toDate
    );

    Optional<Attendance> findByUserIdAndWorkDate(Integer userId, LocalDate workDate);
}