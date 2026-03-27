package com.example.tna.exception;

import com.example.tna.dto.ApiErrorResponseDto;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiErrorResponseDto handleBusinessException(
            BusinessException e,
            HttpServletRequest request
    ) {
        return new ApiErrorResponseDto(
                e.getMessage(),
                request.getRequestURI(),
                LocalDateTime.now().toString()
        );
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiErrorResponseDto handleException(
            Exception e,
            HttpServletRequest request
    ) {
        return new ApiErrorResponseDto(
                e.getMessage(),
                request.getRequestURI(),
                LocalDateTime.now().toString()
        );
    }
}