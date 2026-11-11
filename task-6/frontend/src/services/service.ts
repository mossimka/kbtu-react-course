import type {
    Mission,
    MissionInput,
    MissionPage,
    MissionPriority,
    MissionStatus,
} from '../entities/mission/model/types';
import { auth } from './firebase';
import { invalidateMissionQueries } from './query-client';

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8080').replace(/\/$/, '');

export type MissionQuery = {
    search?: string;
    status?: MissionStatus | 'all';
    priority?: MissionPriority | 'all';
    type?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    page?: number;
    size?: number;
};

type BackendMission = Omit<Mission, 'type' | 'status' | 'priority'> & {
    missionType: string;
    status: Uppercase<MissionStatus>;
    priority: Uppercase<MissionPriority>;
};

type BackendPage = {
    items: BackendMission[];
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
};

export class ApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

const normalizeMission = (mission: BackendMission): Mission => ({
    ...mission,
    type: mission.missionType,
    status: mission.status.toLowerCase() as MissionStatus,
    priority: mission.priority.toLowerCase() as MissionPriority,
});

const parseErrorMessage = (text: string, status: number): string => {
    if (!text) return `Request failed with status ${status}`;
    try {
        const parsed: unknown = JSON.parse(text);
        if (parsed && typeof parsed === 'object' && 'message' in parsed && typeof parsed.message === 'string') {
            return parsed.message;
        }
    } catch {
        return text;
    }
    return text;
};

export const apiRequest = async <T>(path: string, options: RequestInit = {}, signal?: AbortSignal): Promise<T> => {
    const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        signal,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    if (!response.ok) {
        throw new ApiError(parseErrorMessage(await response.text(), response.status), response.status);
    }
    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
};

const toQueryParams = (query: MissionQuery) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== 'all') {
            const parameterName = key === 'sortDirection' ? 'direction' : key;
            const parameterValue = key === 'status' || key === 'priority' ? String(value).toUpperCase() : String(value);
            params.set(parameterName, parameterValue);
        }
    });
    return params;
};

export const getMissions = (query: MissionQuery = {}, signal?: AbortSignal): Promise<MissionPage> =>
    apiRequest<BackendPage>(`/api/missions?${toQueryParams(query).toString()}`, {}, signal).then((result) => ({
        content: result.items.map(normalizeMission),
        page: result.page,
        size: result.size,
        totalElements: result.totalItems,
        totalPages: result.totalPages,
    }));

export const getAllMissions = async (signal?: AbortSignal): Promise<Mission[]> => {
    const size = 50;
    const firstPage = await getMissions({ page: 0, size }, signal);
    const missions = [...firstPage.content];
    for (let page = 1; page < firstPage.totalPages; page += 1) {
        missions.push(...(await getMissions({ page, size }, signal)).content);
    }
    return missions;
};

export const getMission = (id: number, signal?: AbortSignal) =>
    apiRequest<BackendMission>(`/api/missions/${id}`, {}, signal).then(normalizeMission);

const missionBody = (mission: MissionInput) =>
    JSON.stringify({
        ...mission,
        missionType: mission.type,
        status: mission.status.toUpperCase(),
        priority: mission.priority.toUpperCase(),
    });

export const createMission = async (mission: MissionInput) => {
    const result = await apiRequest<BackendMission>('/api/missions', {
        method: 'POST',
        body: missionBody(mission),
    });
    await invalidateMissionQueries();
    return normalizeMission(result);
};

export const updateMission = async (id: number, mission: MissionInput) => {
    const result = await apiRequest<BackendMission>(`/api/missions/${id}`, {
        method: 'PUT',
        body: missionBody(mission),
    });
    await invalidateMissionQueries();
    return normalizeMission(result);
};

export const updateMissionStatus = async (id: number, status: MissionStatus) => {
    const result = await apiRequest<BackendMission>(`/api/missions/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: status.toUpperCase() }),
    });
    await invalidateMissionQueries();
    return normalizeMission(result);
};

export const deleteMission = async (id: number) => {
    await apiRequest<void>(`/api/missions/${id}`, { method: 'DELETE' });
    await invalidateMissionQueries();
};
