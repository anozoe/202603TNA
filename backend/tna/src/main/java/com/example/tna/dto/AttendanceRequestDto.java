package com.example.tna.dto;

import lombok.Data;

import java.util.List;

@Data
public class AttendanceRequestDto {
    private Integer userId;
    private Integer year;
    private Integer month;
    private List<AttendanceRowDto> attendanceRowList;
}