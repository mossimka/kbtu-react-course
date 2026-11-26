package com.mossimka.mission_api.dto;

import jakarta.validation.constraints.NotNull;

import com.mossimka.mission_api.entity.MissionStatus;

public record StatusRequest(@NotNull MissionStatus status) {}
