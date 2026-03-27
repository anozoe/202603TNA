package com.example.tna.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AttendanceRowDto {
    private Integer id;
    @NotNull
    private String workDate;
    private String startTime;
    private String endTime;
    private String breakTime;
    private String actualWorkTime;
    @NotNull
    @Size(max = 2)
    private String workStatus;
}