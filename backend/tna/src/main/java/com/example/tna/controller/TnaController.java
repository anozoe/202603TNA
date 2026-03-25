package com.example.tna.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.tna.dto.TnaRequest;
import com.example.tna.dto.TnaResponse;
import com.example.tna.service.TnaService;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;



@RestController
@RequestMapping("/api/attendance")
public class TnaController {

    public TnaController(TnaService tnaService) {
        this.tnaService = tnaService;
    }

    private final TnaService tnaService;

    @GetMapping("/{yearMonth}/{id}")
    public ResponseEntity<List<TnaResponse>> getAttendanceById(@PathVariable Integer yearMonth, @PathVariable Integer id) {
        List<TnaResponse> tnaResult = tnaService.getAttendanceById(yearMonth, id);
        return ResponseEntity.ok(tnaResult);
    }
    
    @PutMapping("/{yearMonth}/{id}")
    public ResponseEntity<TnaResponse> updateAttendance(@PathVariable Integer yearMonth, @PathVariable Integer id, @RequestBody TnaRequest request) {
        //TODO: 要修正
        TnaResponse updatedAttendance = tnaService.updateAttendance(yearMonth, id, request);
        return ResponseEntity.ok(updatedAttendance);
    }
}
