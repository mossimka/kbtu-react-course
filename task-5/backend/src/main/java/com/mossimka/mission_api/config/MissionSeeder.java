package com.mossimka.mission_api.config;

import com.mossimka.mission_api.entity.Mission;
import com.mossimka.mission_api.entity.MissionPriority;
import com.mossimka.mission_api.entity.MissionStatus;
import com.mossimka.mission_api.repository.MissionRepository;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MissionSeeder implements CommandLineRunner {

    private static final String[] PREFIXES = {
            "Aurora", "Orion", "Helios", "Vega", "Lyra",
            "Atlas", "Nova", "Perseus", "Pegasus", "Draco"
    };

    private static final String[] DESTINATIONS = {
            "Moon", "Mars", "Europa", "Titan", "Venus",
            "Ceres", "Enceladus", "Low Earth Orbit", "Jupiter", "Saturn"
    };

    private static final String[] TYPES = {
            "EXPLORATION",
            "RESEARCH",
            "COLONIZATION",
            "RESCUE",
            "SATELLITE_DEPLOYMENT"
    };

    private final MissionRepository repository;

    @Override
    public void run(String... args) {
        // Don't insert duplicate records on every restart.
        if (repository.count() > 0) {
            return;
        }

        MissionStatus[] statuses = MissionStatus.values();
        MissionPriority[] priorities = MissionPriority.values();

        List<Mission> missions = new ArrayList<>();

        for (int i = 0; i < 120; i++) {
            Mission mission = new Mission();

            mission.setName(
                    PREFIXES[i % PREFIXES.length] + " " + (i + 1)
            );

            mission.setDestination(
                    DESTINATIONS[(i * 3) % DESTINATIONS.length]
            );

            String type = TYPES[i % TYPES.length];
            mission.setMissionType(type);

            mission.setStatus(
                    statuses[(i * 7) % statuses.length]
            );

            mission.setPriority(
                    priorities[(i * 3) % priorities.length]
            );

            mission.setCrew(1 + (i * 5) % 12);

            mission.setLaunchDate(
                    LocalDate.of(2026, 1, 1).plusDays(i * 9L)
            );

            mission.setDescription(
                    "Simulated "
                            + type.toLowerCase().replace('_', ' ')
                            + " mission to "
                            + mission.getDestination()
                            + "."
            );

            missions.add(mission);
        }

        repository.saveAll(missions);
    }
}