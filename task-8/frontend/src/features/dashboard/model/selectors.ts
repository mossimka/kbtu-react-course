import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../../app/store';
import type { Mission, MissionPriority, MissionStatus } from '../../../entities/mission/model/types';
import { selectDashboardState } from './dashboard-slice';

export type DashboardFilters = {
    status: MissionStatus | 'all';
    priority: MissionPriority | 'all';
    type: string;
};

type BreakdownItem = { key: string; label: string; count: number; to: string };

const selectMissions = (state: RootState) => selectDashboardState(state).missions;
const selectFilters = (_state: RootState, filters: DashboardFilters) => filters;

export const selectDashboardTypes = createSelector([selectMissions], (missions) =>
    [...new Set(missions.map((mission) => mission.type))].sort((a, b) => a.localeCompare(b)),
);

export const selectFilteredDashboardMissions = createSelector([selectMissions, selectFilters], (missions, filters) =>
    missions.filter(
        (mission) =>
            (filters.status === 'all' || mission.status === filters.status) &&
            (filters.priority === 'all' || mission.priority === filters.priority) &&
            (filters.type === 'all' || mission.type === filters.type),
    ),
);

const toBreakdown = (missions: Mission[], pick: (mission: Mission) => string, link: (key: string) => string) => {
    const counts = new Map<string, number>();
    missions.forEach((mission) => {
        const key = pick(mission);
        counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return [...counts.entries()]
        .sort((left, right) => right[1] - left[1])
        .map(([key, count]): BreakdownItem => ({ key, label: key.replaceAll('_', ' '), count, to: link(key) }));
};

export const selectDashboardAnalytics = createSelector([selectFilteredDashboardMissions], (missions) => {
    const total = missions.length;
    const totalCrew = missions.reduce((sum, mission) => sum + mission.crew, 0);

    return {
        total,
        active: missions.filter((mission) => mission.status === 'active').length,
        completed: missions.filter((mission) => mission.status === 'completed').length,
        totalCrew,
        averageCrew: total ? (totalCrew / total).toFixed(1) : '0.0',
        criticalPriority: missions.filter((mission) => mission.priority === 'critical').length,
        statusBreakdown: toBreakdown(
            missions,
            (mission) => mission.status,
            (key) => `/missions?status=${key}`,
        ),
        priorityBreakdown: toBreakdown(
            missions,
            (mission) => mission.priority,
            (key) => `/missions?priority=${key}`,
        ),
        typeBreakdown: toBreakdown(
            missions,
            (mission) => mission.type,
            (key) => `/missions?search=${encodeURIComponent(key.replaceAll('_', ' '))}`,
        ),
        destinationBreakdown: toBreakdown(
            missions,
            (mission) => mission.destination,
            (key) => `/missions?search=${encodeURIComponent(key)}`,
        ),
    };
});
