package com.example.tna.exception;

import com.example.tna.dto.ApiErrorResponseDto;
import com.example.tna.service.MessageService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private final MessageService messageService;

    public GlobalExceptionHandler(MessageService messageService) {
        this.messageService = messageService;
    }

    @ExceptionHandler(BusinessException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiErrorResponseDto handleBusinessException(
            BusinessException e,
            HttpServletRequest request
    ) {
        String message = messageService.getMessage(e.getMessageId(), e.getParams());

        return new ApiErrorResponseDto(
                e.getMessageId(),
                message,
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
                "E007",
                messageService.getMessage("E007", "サーバー"),
                request.getRequestURI(),
                LocalDateTime.now().toString()
        );
    }
}