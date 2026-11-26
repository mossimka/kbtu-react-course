import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../../../app/store';
import type { Mission, MissionInput, MissionPage, MissionStatus } from '../../../entities/mission/model/types';
import { MISSION_CACHE_TTL_MS } from '../../../shared/configs/mission.config';
import {
    createMission,
    deleteMission,
    getMissions,
    updateMission,
    updateMissionStatus,
    type MissionQuery,
} from '../../../services/service';
import { fetchDashboardMissions } from '../../dashboard/model/dashboard-slice';

type RequestStatus = 'idle' | 'pending' | 'fulfilled' | 'rejected';

type MutationArgument =
    | { type: 'create'; input: MissionInput }
    | { type: 'update'; id: number; input: MissionInput }
    | { type: 'status'; id: number; status: MissionStatus }
    | { type: 'delete'; id: number };

export type MutationResult = { type: MutationArgument['type']; mission?: Mission; id?: number };

type MutationState = { status: RequestStatus; error: string | null; requestId: string | null };

type MissionsState = {
    items: Mission[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    query: MissionQuery | null;
    queryKey: string | null;
    status: RequestStatus;
    error: string | null;
    requestId: string | null;
    updatedAt: number | null;
    mutation: MutationState;
};

const initialState: MissionsState = {
    items: [],
    page: 0,
    size: 0,
    totalElements: 0,
    totalPages: 0,
    query: null,
    queryKey: null,
    status: 'idle',
    error: null,
    requestId: null,
    updatedAt: null,
    mutation: { status: 'idle', error: null, requestId: null },
};

const queryKey = (query: MissionQuery) => JSON.stringify(query);

/**
 * Loads one page of missions. The `condition` guard prevents duplicate
 * requests for the same query and reuses a fresh cached page.
 */
export const fetchMissions = createAsyncThunk<
    MissionPage,
    { query: MissionQuery; force?: boolean },
    { state: RootState; rejectValue: string }
>(
    'missions/fetch',
    async ({ query }, { rejectWithValue, signal }) => {
        try {
            return await getMissions(query, signal);
        } catch (error) {
            if (signal.aborted) throw error;
            return rejectWithValue(
                error instanceof Error ? error.message : 'The mission manifest could not be loaded.',
            );
        }
    },
    {
        condition: ({ query, force }, { getState }) => {
            const state = getState().missions;
            const key = queryKey(query);

            if (state.status === 'pending' && state.queryKey === key) return false;
            if (force || state.status !== 'fulfilled' || state.queryKey !== key) return true;

            return Date.now() - (state.updatedAt ?? 0) >= MISSION_CACHE_TTL_MS;
        },
    },
);

/**
 * Creates, updates, changes status of, or deletes a mission. After a
 * successful mutation the loaded list and dashboard are refreshed.
 */
export const saveMission = createAsyncThunk<
    MutationResult,
    MutationArgument,
    { state: RootState; rejectValue: string }
>('missions/save', async (operation, { dispatch, getState, rejectWithValue }) => {
    try {
        let result: MutationResult;

        if (operation.type === 'create') {
            result = { type: operation.type, mission: await createMission(operation.input) };
        } else if (operation.type === 'update') {
            result = { type: operation.type, mission: await updateMission(operation.id, operation.input) };
        } else if (operation.type === 'status') {
            result = {
                type: operation.type,
                mission: await updateMissionStatus(operation.id, operation.status),
            };
        } else {
            await deleteMission(operation.id);
            result = { type: operation.type, id: operation.id };
        }

        const { query } = getState().missions;
        const refreshes: Promise<unknown>[] = [];

        if (query) refreshes.push(dispatch(fetchMissions({ query, force: true })));
        if (getState().dashboard.status !== 'idle') {
            refreshes.push(dispatch(fetchDashboardMissions({ force: true })));
        }

        await Promise.all(refreshes);
        return result;
    } catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : 'The mission operation failed.');
    }
});

const missionsSlice = createSlice({
    name: 'missions',
    initialState,
    reducers: {
        clearMissionMutationError(state) {
            state.mutation.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMissions.pending, (state, action) => {
                state.query = action.meta.arg.query;
                state.queryKey = queryKey(action.meta.arg.query);
                state.status = 'pending';
                state.error = null;
                state.requestId = action.meta.requestId;
            })
            .addCase(fetchMissions.fulfilled, (state, action) => {
                if (state.requestId !== action.meta.requestId) return;

                state.items = action.payload.content;
                state.page = action.payload.page;
                state.size = action.payload.size;
                state.totalElements = action.payload.totalElements;
                state.totalPages = action.payload.totalPages;
                state.status = 'fulfilled';
                state.error = null;
                state.requestId = null;
                state.updatedAt = Date.now();
            })
            .addCase(fetchMissions.rejected, (state, action) => {
                if (state.requestId !== action.meta.requestId) return;

                state.status = 'rejected';
                state.error = action.payload ?? action.error.message ?? 'The mission manifest could not be loaded.';
                state.requestId = null;
            })
            .addCase(saveMission.pending, (state, action) => {
                state.mutation.status = 'pending';
                state.mutation.error = null;
                state.mutation.requestId = action.meta.requestId;
            })
            .addCase(saveMission.fulfilled, (state, action) => {
                if (state.mutation.requestId !== action.meta.requestId) return;

                state.mutation.status = 'fulfilled';
                state.mutation.error = null;
                state.mutation.requestId = null;
            })
            .addCase(saveMission.rejected, (state, action) => {
                if (state.mutation.requestId !== action.meta.requestId) return;

                state.mutation.status = 'rejected';
                state.mutation.error = action.payload ?? action.error.message ?? 'The mission operation failed.';
                state.mutation.requestId = null;
            });
    },
});

export const { clearMissionMutationError } = missionsSlice.actions;

export const selectMissionsState = (state: RootState) => state.missions;
export const selectMissionItems = (state: RootState) => state.missions.items;
export const selectMissionMutation = (state: RootState) => state.missions.mutation;

export const selectMissionSummary = createSelector(
    [selectMissionItems, (state: RootState) => state.missions.totalElements],
    (missions, total) => ({
        total,
        active: missions.filter((mission) => mission.status === 'active').length,
        completed: missions.filter((mission) => mission.status === 'completed').length,
    }),
);

export default missionsSlice.reducer;
