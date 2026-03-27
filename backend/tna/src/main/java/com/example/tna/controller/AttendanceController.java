package com.example.tna.controller;

import com.example.tna.dto.AttendanceRequestDto;
import com.example.tna.dto.AttendanceResponseDto;

import com.example.tna.service.AttendanceService;
import lombok.RequiredArgsConstructor;



import org.springframework.http.ResponseEntity;
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
    public AttendanceResponseDto updateAttendance(@RequestBody AttendanceRequestDto requestDto) {
        return attendanceService.saveAttendance(requestDto);
    }

    @GetMapping("/{yearMonth}/{id}")
    public ResponseEntity<AttendanceResponseDto> getAttendanceById(@PathVariable Integer yearMonth, @PathVariable Integer id) {
        AttendanceResponseDto result = attendanceService.getAttendanceById(yearMonth, id);
        return ResponseEntity.ok(result);
    }
    
    @PutMapping("/{yearMonth}/{id}")
    public ResponseEntity<AttendanceResponseDto> updateAttendance(@PathVariable Integer yearMonth, @PathVariable Integer id, @RequestBody AttendanceRequestDto request) {
        //TODO: 要修正
        AttendanceResponseDto updatedAttendance = attendanceService.updateAttendance(yearMonth, id, request);
        return ResponseEntity.ok(updatedAttendance);
    }
}