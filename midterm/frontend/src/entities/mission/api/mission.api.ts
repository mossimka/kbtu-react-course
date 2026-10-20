import type { Mission, MissionInput, MissionPriority, MissionStatus } from '../model/types';

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8080').replace(/\/$/, '');

export type MissionQuery = {
    search?: string;
    status?: MissionStatus | 'all';
    priority?: MissionPriority | 'all';
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    page?: number;
    size?: number;
};

const normalizeMission = (mission: BackendMission): Mission => ({
    ...mission,
    type: mission.missionType,
    status: mission.status.toLowerCase() as MissionStatus,
    priority: mission.priority.toLowerCase() as MissionPriority,
});

type BackendMission = Omit<Mission, 'type' | 'status' | 'priority'> & {
    missionType: string;
    status: Uppercase<MissionStatus>;
    priority: Uppercase<MissionPriority>;
};

const request = async <T>(path: string, options: RequestInit = {}, signal?: AbortSignal): Promise<T> => {
    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        signal,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Request failed with status ${response.status}`);
    }

    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
};

export const getMissions = (query: MissionQuery, signal?: AbortSignal) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== 'all') {
            const parameterName = key === 'sortDirection' ? 'direction' : key;
            const parameterValue = key === 'status' || key === 'priority' ? String(value).toUpperCase() : String(value);
            params.set(parameterName, parameterValue);
        }
    });
    return request<{
        items: BackendMission[];
        page: number;
        size: number;
        totalItems: number;
        totalPages: number;
    }>(`/api/missions?${params.toString()}`, {}, signal).then((result) => ({
        content: result.items.map(normalizeMission),
        page: result.page,
        size: result.size,
        totalElements: result.totalItems,
        totalPages: result.totalPages,
    }));
};

export const getMission = (id: number, signal?: AbortSignal) =>
    request<BackendMission>(`/api/missions/${id}`, {}, signal).then(normalizeMission);

export const createMission = (mission: MissionInput) =>
    request<BackendMission>('/api/missions', {
        method: 'POST',
        body: JSON.stringify({
            ...mission,
            missionType: mission.type,
            status: mission.status.toUpperCase(),
            priority: mission.priority.toUpperCase(),
        }),
    }).then(normalizeMission);

export const updateMissionStatus = (id: number, status: MissionStatus) =>
    request<BackendMission>(`/api/missions/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: status.toUpperCase() }),
    }).then(normalizeMission);

export const deleteMission = (id: number) => request<void>(`/api/missions/${id}`, { method: 'DELETE' });
