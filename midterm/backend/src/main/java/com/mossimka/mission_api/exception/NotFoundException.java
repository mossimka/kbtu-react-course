package com.mossimka.mission_api.exception;

public class NotFoundException extends RuntimeException {
    public NotFoundException(Long id) {
        super("Mission with id " + id + " not found");
    }
}
