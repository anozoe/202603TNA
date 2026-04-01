package com.example.tna.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ApiErrorResponseDto {
    private String messageId;
    private String message;
    private String path;
    private String timestamp;
}