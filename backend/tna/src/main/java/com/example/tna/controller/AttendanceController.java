package com.example.tna.controller;

import com.example.tna.dto.AttendanceRequestDto;
import com.example.tna.dto.AttendanceResponseDto;
import com.example.tna.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping
    public AttendanceResponseDto getAttendance(
            @RequestParam Integer userId,
            @RequestParam Integer year,
            @RequestParam Integer month
    ) {
        return attendanceService.getAttendance(userId, year, month);
    }

    @PutMapping
    public AttendanceResponseDto saveAttendance(@RequestBody AttendanceRequestDto attendanceRequestDto) {
        return attendanceService.saveAttendance(attendanceRequestDto);
    }
}