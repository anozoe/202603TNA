package com.example.tna.dto;

import lombok.Data;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

@Data
public class AttendanceRequestDto {
    @NotNull
    private Integer userId;

    @NotNull
    private Integer year;

    @NotNull
    private Integer month;

    @Valid 
    private List<AttendanceRowDto> attendanceRowList;
}