package com.example.tna.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "attendance")
@Data
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "work_date", nullable = false)
    private LocalDate workDate;

    private LocalTime startTime;

    private LocalTime endTime;

    private LocalTime breakTime;

    @Column(name = "actual_work_time", nullable = false)
    private LocalTime actualWorkTime;

    private String workStatus;

    private LocalDateTime createdAt;

    private String createdBy;

    private LocalDateTime updatedAt;

    private String updatedBy;
}
