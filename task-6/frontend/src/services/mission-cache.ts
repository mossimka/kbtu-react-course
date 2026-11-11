import type { MissionPage } from '../entities/mission/model/types';
import { getMissions, type MissionQuery } from './service';

const CACHE_TTL_MS = 30_000;
const cache = new Map<string, { value: MissionPage; expiresAt: number }>();

const cacheKey = (query: MissionQuery) =>
    JSON.stringify(
        Object.entries(query)
            .filter(([, value]) => value !== undefined)
            .sort(([first], [second]) => first.localeCompare(second)),
    );

export const getCachedMissionPage = async (query: MissionQuery, signal?: AbortSignal): Promise<MissionPage> => {
    const key = cacheKey(query);
    const cached = cache.get(key);
    if (cached && cached.expiresAt > Date.now()) return cached.value;

    const value = await getMissions(query, signal);
    if (!signal?.aborted) cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
    return value;
};

export const invalidateMissionCache = () => cache.clear();
