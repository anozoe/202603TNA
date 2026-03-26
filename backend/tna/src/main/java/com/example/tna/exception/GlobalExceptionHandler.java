package com.example.tna.exception;

import com.example.tna.dto.ApiErrorResponseDto;
import com.example.tna.service.MessageService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler {

    private final MessageService messageService;

    @ExceptionHandler(BusinessException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiErrorResponseDto handleBusinessException(
            BusinessException e,
            HttpServletRequest request
    ) {
        return new ApiErrorResponseDto(
                e.getMessageId(),
                messageService.getMessage(e.getMessageId(), e.getArgs())
        );
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiErrorResponseDto handleException(
            Exception e,
            HttpServletRequest request
    ) {
        return new ApiErrorResponseDto(
                "DEFAULT",
                "システムエラーが発生しました。"
        );
    }
}