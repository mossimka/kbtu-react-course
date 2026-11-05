import type {
    Mission,
    MissionInput,
    MissionPage,
    MissionPriority,
    MissionStatus,
} from '../entities/mission/model/types';
import { getToken } from './token';

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
        // The response body is not JSON, so use it as the error message.
    }

    return text;
};

export const apiRequest = async <T>(path: string, options: RequestInit = {}, signal?: AbortSignal): Promise<T> => {
    const token = getToken();

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
        const text = await response.text();
        throw new ApiError(parseErrorMessage(text, response.status), response.status);
    }

    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
};

export const getMissions = (query: MissionQuery = {}, signal?: AbortSignal): Promise<MissionPage> => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== 'all') {
            const parameterName = key === 'sortDirection' ? 'direction' : key;
            const parameterValue = key === 'status' || key === 'priority' ? String(value).toUpperCase() : String(value);
            params.set(parameterName, parameterValue);
        }
    });

    return apiRequest<BackendPage>(`/api/missions?${params.toString()}`, {}, signal).then((result) => ({
        content: result.items.map(normalizeMission),
        page: result.page,
        size: result.size,
        totalElements: result.totalItems,
        totalPages: result.totalPages,
    }));
};

/**
 * Loads every mission across all API pages. The backend limits `size` to 50,
 * so analytics pages have to walk the page list.
 */
export const getAllMissions = async (signal?: AbortSignal): Promise<Mission[]> => {
    const size = 50;
    const firstPage = await getMissions({ page: 0, size }, signal);
    const missions = [...firstPage.content];

    for (let page = 1; page < firstPage.totalPages; page += 1) {
        const nextPage = await getMissions({ page, size }, signal);
        missions.push(...nextPage.content);
    }

    return missions;
};

export const getMission = (id: number, signal?: AbortSignal) =>
    apiRequest<BackendMission>(`/api/missions/${id}`, {}, signal).then(normalizeMission);

export const createMission = (mission: MissionInput) =>
    apiRequest<BackendMission>('/api/missions', {
        method: 'POST',
        body: JSON.stringify({
            ...mission,
            missionType: mission.type,
            status: mission.status.toUpperCase(),
            priority: mission.priority.toUpperCase(),
        }),
    }).then(normalizeMission);

export const updateMission = (id: number, mission: MissionInput) =>
    apiRequest<BackendMission>(`/api/missions/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            ...mission,
            missionType: mission.type,
            status: mission.status.toUpperCase(),
            priority: mission.priority.toUpperCase(),
        }),
    }).then(normalizeMission);

export const updateMissionStatus = (id: number, status: MissionStatus) =>
    apiRequest<BackendMission>(`/api/missions/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: status.toUpperCase() }),
    }).then(normalizeMission);

export const deleteMission = (id: number) => apiRequest<void>(`/api/missions/${id}`, { method: 'DELETE' });
