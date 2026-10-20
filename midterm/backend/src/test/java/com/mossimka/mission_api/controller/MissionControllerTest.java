package com.mossimka.mission_api.controller;

import com.jayway.jsonpath.JsonPath;

import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
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
    void validCreateReturns201() throws Exception {
        String body = """
                {
                    "name": "Test Mission",
                    "destination": "Mars",
                    "type": "CARGO",
                    "status": "ACTIVE",
                    "priority": "HIGH",
                    "crew": 4,
                    "launchDate": "2027-03-01"
                }
                """;

        mvc.perform(post("/api/missions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists());
    }

    @Test
    void invalidCreateReturns400() throws Exception {
        String body = """
                {
                    "name": "x",
                    "destination": "",
                    "type": "CARGO",
                    "status": "ACTIVE",
                    "priority": "LOW",
                    "crew": 0,
                    "launchDate": "2027-01-01"
                }
                """;

        mvc.perform(post("/api/missions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors").exists());
    }

    @Test
    void deleteRemovesMission() throws Exception {
        String body = """
                {
                    "name": "To Delete",
                    "destination": "Moon",
                    "type": "SURVEY",
                    "status": "PAUSED",
                    "priority": "LOW",
                    "crew": 1,
                    "launchDate": "2027-05-01"
                }
                """;

        String response = mvc.perform(post("/api/missions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Long id = JsonPath.parse(response).read("$.id", Long.class);

        mvc.perform(delete("/api/missions/" + id))
                .andExpect(status().isNoContent());

        mvc.perform(get("/api/missions/" + id))
                .andExpect(status().isNotFound());
    }
}