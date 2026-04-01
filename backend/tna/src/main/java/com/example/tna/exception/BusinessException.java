package com.example.tna.exception;

import lombok.Getter;

@Getter
public class BusinessException extends RuntimeException {

    private final String messageId;
    private final Object[] params;

    public BusinessException(String messageId, Object... params) {
        super(messageId);
        this.messageId = messageId;
        this.params = params;
    }
}