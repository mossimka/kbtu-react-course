package com.mossimka.mission_api.dto;

import java.time.LocalDate;

import com.mossimka.mission_api.entity.MissionPriority;
import com.mossimka.mission_api.entity.MissionStatus;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record MissionRequest(
    @NotBlank @Size(min = 3, max = 100) String name,
    @NotBlank @Size(max = 100) String destination,
    @NotBlank @Size(max = 100) String missionType,
    @NotNull MissionPriority priority,
    @NotNull MissionStatus status,
    @NotNull @Min (1) Integer crew,
    @Size(max = 1000) String description,
    @NotNull LocalDate launchDate
) {}
