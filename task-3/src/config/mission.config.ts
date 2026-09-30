import type { MissionPriority } from '../data/missions';

export const FILTER = {
    ALL: 'all',
    ACTIVE: 'active',
    COMPLETED: 'completed',
    CRITICAL: 'critical',
} as const;

export type MissionFilter = (typeof FILTER)[keyof typeof FILTER];

export const FILTER_OPTIONS: MissionFilter[] = Object.values(FILTER);

export const STATUS = {
    ACTIVE: 'active',
    COMPLETED: 'completed',
} as const;

export const DEFAULT_MISSION_TYPE = 'Exploration';
export const DEFAULT_CREW_SIZE = 4;
export const DEFAULT_PRIORITY: MissionPriority = 'medium';

export const INITIAL_RESET_VERSION = 0;

export const FUEL = {
    MAX: 100,
    MIN: 0,
    COST_PER_CHECK: 5,
    LOW_THRESHOLD: 20,
} as const;

export const INITIAL_CHECKS = 0;

export const STAT_PAD_LENGTH = 2;
export const STAT_PAD_CHAR = '0';

export const MOCK_UTC_TIME = '14:32:08';
