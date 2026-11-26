package com.mossimka.mission_api.controller;

import com.mossimka.mission_api.dto.MissionRequest;
import com.mossimka.mission_api.dto.MissionResponse;
import com.mossimka.mission_api.dto.PageResponse;
import com.mossimka.mission_api.dto.StatusRequest;
import com.mossimka.mission_api.entity.MissionPriority;
import com.mossimka.mission_api.entity.MissionStatus;
import com.mossimka.mission_api.service.MissionService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;

@RestController
@RequestMapping("/api/missions")
@RequiredArgsConstructor
public class MissionController {

    private final MissionService service;

    @GetMapping
    public PageResponse<MissionResponse> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) MissionStatus status,
            @RequestParam(required = false) MissionPriority priority,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "launchDate") String sortBy,
            @RequestParam(defaultValue = "asc") String direction,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return service.findAll(search, status, priority, type, sortBy, direction, page, size);
    }

    @GetMapping("/{id}")
    public MissionResponse get(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MissionResponse create(@Valid @RequestBody MissionRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public MissionResponse update(@PathVariable Long id,
                                  @Valid @RequestBody MissionRequest request) {
        return service.update(id, request);
    }

    @PatchMapping("/{id}/status")
    public MissionResponse updateStatus(@PathVariable Long id,
                                        @Valid @RequestBody StatusRequest request) {
        return service.updateStatus(id, request.status());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
