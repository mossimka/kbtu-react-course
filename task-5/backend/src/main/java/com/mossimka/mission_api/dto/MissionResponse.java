package com.mossimka.mission_api.dto;

import com.mossimka.mission_api.entity.MissionPriority;
import com.mossimka.mission_api.entity.MissionStatus;
import com.mossimka.mission_api.entity.Mission;

public record MissionResponse(
    Long id,
    String name,
    String destination,
    String missionType,
    MissionPriority priority,
    MissionStatus status,
    Integer crew,
    String description,
    String launchDate,
    String createdAt,
    String updatedAt
) {
    public static MissionResponse from(Mission mission) {
        return new MissionResponse(
            mission.getId(),
            mission.getName(),
            mission.getDestination(),
            mission.getMissionType(),
            mission.getPriority(),
            mission.getStatus(),
            mission.getCrew(),
            mission.getDescription(),
            mission.getLaunchDate().toString(),
            mission.getCreatedAt().toString(),
            mission.getUpdatedAt().toString()
        );
    }
}
