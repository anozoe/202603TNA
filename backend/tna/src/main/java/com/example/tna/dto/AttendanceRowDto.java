package com.example.tna.dto;

import lombok.Data;

@Data
public class AttendanceRowDto {
    private Integer id;
    private String workDate;
    private String startTime;
    private String endTime;
    private String breakTime;
    private String actualWorkTime;
    private String workStatus;
}