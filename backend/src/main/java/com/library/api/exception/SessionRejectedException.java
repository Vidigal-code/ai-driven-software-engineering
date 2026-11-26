package com.library.api.exception;

import org.springframework.http.HttpStatus;

public class SessionRejectedException extends ApiException {
    public SessionRejectedException() {
        super(HttpStatus.UNAUTHORIZED, "Credenciais ou sessão inválidas.");
    }
}
