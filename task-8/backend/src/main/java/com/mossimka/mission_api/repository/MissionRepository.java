package com.mossimka.mission_api.repository;

import com.mossimka.mission_api.entity.Mission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface MissionRepository
        extends JpaRepository<Mission, Long>,
                JpaSpecificationExecutor<Mission> {
}