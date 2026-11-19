package com.mossimka.mission_api.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import jakarta.persistence.criteria.Predicate;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mossimka.mission_api.dto.MissionRequest;
import com.mossimka.mission_api.dto.MissionResponse;
import com.mossimka.mission_api.dto.PageResponse;
import com.mossimka.mission_api.entity.Mission;
import com.mossimka.mission_api.entity.MissionPriority;
import com.mossimka.mission_api.entity.MissionStatus;
import com.mossimka.mission_api.exception.NotFoundException;
import com.mossimka.mission_api.repository.MissionRepository;

@Service
@Transactional
@RequiredArgsConstructor
public class MissionService {

    // Whitelist of allowed sorting fields.
    // Prevents clients from sorting by arbitrary entity properties.
    private static final Map<String, String> SORTABLE = Map.of(
            "name", "name",
            "priority", "priority",
            "crew", "crew",
            "launchDate", "launchDate"
    );

    private final MissionRepository repository;

    @Transactional(readOnly = true)
    public PageResponse<MissionResponse> findAll(
            String search,
            MissionStatus status,
            MissionPriority priority,
            String type,
            String sortBy,
            String direction,
            int page,
            int size
    ) {
        if (page < 0) {
            throw new IllegalArgumentException("page must be >= 0");
        }

        if (size < 1 || size > 50) {
            throw new IllegalArgumentException("size must be 1..50");
        }

        String property = SORTABLE.get(sortBy);

        if (property == null) {
            throw new IllegalArgumentException(
                    "Unsupported sort field: " + sortBy
            );
        }

        Sort.Direction dir = "desc".equalsIgnoreCase(direction)
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;

        // Secondary sorting by ID ensures stable pagination.
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(dir, property).and(Sort.by("id"))
        );

        Page<Mission> result = repository.findAll(
                buildSpec(search, status, priority, type),
                pageable
        );

        return new PageResponse<>(
                result.map(MissionResponse::from).getContent(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages()
        );
    }

    @Transactional(readOnly = true)
    public MissionResponse findById(Long id) {
        return MissionResponse.from(getOrThrow(id));
    }

    public MissionResponse create(MissionRequest request) {
        Mission mission = new Mission();

        apply(mission, request);

        Mission savedMission = repository.save(mission);

        return MissionResponse.from(savedMission);
    }

    public MissionResponse update(Long id, MissionRequest request) {
        Mission mission = getOrThrow(id);

        apply(mission, request);

        return MissionResponse.from(mission);
    }

    public MissionResponse updateStatus(Long id, MissionStatus status) {
        Mission mission = getOrThrow(id);

        mission.setStatus(status);

        return MissionResponse.from(mission);
    }

    public void delete(Long id) {
        repository.delete(getOrThrow(id));
    }

    private Mission getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException(id));
    }

    private void apply(Mission mission, MissionRequest request) {
        mission.setName(request.name());
        mission.setDestination(request.destination());
        mission.setMissionType(request.missionType());
        mission.setStatus(request.status());
        mission.setPriority(request.priority());
        mission.setCrew(request.crew());
        mission.setDescription(request.description());
        mission.setLaunchDate(request.launchDate());
    }

    private Specification<Mission> buildSpec(
            String search,
            MissionStatus status,
            MissionPriority priority,
            String type
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Search by mission name, destination, or type.
            if (search != null && !search.isBlank()) {
                String like = "%" + search.trim().toLowerCase() + "%";

                predicates.add(
                        cb.or(
                                cb.like(
                                        cb.lower(root.get("name")),
                                        like
                                ),
                                cb.like(
                                        cb.lower(root.get("destination")),
                                        like
                                ),
                                cb.like(
                                        cb.lower(root.get("missionType")),
                                        like
                                )
                        )
                );
            }

            // Filter by status.
            if (status != null) {
                predicates.add(
                        cb.equal(root.get("status"), status)
                );
            }

            // Filter by priority.
            if (priority != null) {
                predicates.add(
                        cb.equal(root.get("priority"), priority)
                );
            }

            // Filter by mission type (String).
            if (type != null && !type.isBlank()) {
                predicates.add(
                        cb.equal(root.get("missionType"), type)
                );
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}