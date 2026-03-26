package com.example.tna.exception;

import lombok.Getter;

@Getter
public class BusinessException extends RuntimeException {
    private final String messageId;
    private final Object[] args;

    public BusinessException(String messageId, Object... args) {
        super(messageId);
        this.messageId = messageId;
        this.args = args;
    }
}