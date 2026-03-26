package com.example.tna.repository;

import com.example.tna.dto.UserResponse;
import com.example.tna.entity.Attendance;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    @Query(
        value = """
            SELECT
                a.user_id AS userId,
                u.name AS name,
                SUM(a.work_status <> '5') AS workDays,
                CAST(SEC_TO_TIME(SUM(TIME_TO_SEC(a.actual_work_time))) AS CHAR) AS workTimeTotal
            FROM attendance a
            JOIN users u ON u.id = a.user_id
            WHERE a.work_date BETWEEN :fromDate AND :toDate
            GROUP BY a.user_id, u.name
            ORDER BY a.user_id
            """,
        countQuery = """
            SELECT COUNT(*) FROM (
                SELECT a.user_id
                FROM attendance a
                JOIN users u ON u.id = a.user_id
                WHERE a.work_date BETWEEN :fromDate AND :toDate
                GROUP BY a.user_id, u.name
            ) summary_count
            """,
        nativeQuery = true
    )
    Page<UserResponse> findSummaryByMonth(
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            Pageable pageable
    );
}