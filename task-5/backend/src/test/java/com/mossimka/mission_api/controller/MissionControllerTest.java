package com.mossimka.mission_api.controller;

import com.jayway.jsonpath.JsonPath;

import java.util.UUID;

import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class MissionControllerTest {

    @Autowired
    private MockMvc mvc;

    @Test
    void healthReturnsUp() throws Exception {
        mvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void listContainsAtLeast100Missions() throws Exception {
        mvc.perform(get("/api/missions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems")
                        .value(greaterThanOrEqualTo(100)));
    }

    @Test
    void searchReturnsMatchingMissions() throws Exception {
        mvc.perform(get("/api/missions").param("search", "Artemis"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray());
    }

    @Test
    void unknownMissionReturns404() throws Exception {
        mvc.perform(get("/api/missions/999999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void createWithoutTokenReturns401() throws Exception {
        mvc.perform(post("/api/missions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validMissionBody("Unauthorized Mission")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void validCreateReturns201() throws Exception {
        mvc.perform(post("/api/missions")
                        .header(HttpHeaders.AUTHORIZATION, bearerToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validMissionBody("Test Mission")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Test Mission"));
    }

    @Test
    void invalidCreateReturns400() throws Exception {
        String body = """
                {
                    "name": "x",
                    "destination": "",
                    "missionType": "CARGO",
                    "status": "ACTIVE",
                    "priority": "LOW",
                    "crew": 0,
                    "launchDate": "2027-01-01"
                }
                """;

        mvc.perform(post("/api/missions")
                        .header(HttpHeaders.AUTHORIZATION, bearerToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors").exists());
    }

    @Test
    void deleteRemovesMission() throws Exception {
        String token = bearerToken();
        String body = """
                {
                    "name": "To Delete",
                    "destination": "Moon",
                    "missionType": "SURVEY",
                    "status": "COMPLETED",
                    "priority": "LOW",
                    "crew": 1,
                    "launchDate": "2027-05-01"
                }
                """;

        String response = mvc.perform(post("/api/missions")
                        .header(HttpHeaders.AUTHORIZATION, token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Long id = JsonPath.parse(response).read("$.id", Long.class);

        mvc.perform(delete("/api/missions/" + id)
                        .header(HttpHeaders.AUTHORIZATION, token))
                .andExpect(status().isNoContent());

        mvc.perform(get("/api/missions/" + id))
                .andExpect(status().isNotFound());
    }

    private String bearerToken() throws Exception {
        String email = "mission-tester-" + UUID.randomUUID() + "@example.com";
        String body = """
                {
                    "name": "Test Operator",
                    "email": "%s",
                    "password": "password123"
                }
                """.formatted(email);

        String response = mvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        return "Bearer " + JsonPath.parse(response).read("$.token", String.class);
    }

    private String validMissionBody(String name) {
        return """
                {
                    "name": "%s",
                    "destination": "Mars",
                    "missionType": "CARGO",
                    "status": "ACTIVE",
                    "priority": "HIGH",
                    "crew": 4,
                    "launchDate": "2027-03-01"
                }
                """.formatted(name);
    }
}
