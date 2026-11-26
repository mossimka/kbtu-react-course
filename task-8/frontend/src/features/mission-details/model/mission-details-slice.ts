import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../../../app/store';
import type { Mission } from '../../../entities/mission/model/types';
import { MISSION_CACHE_TTL_MS } from '../../../shared/configs/mission.config';
import { ApiError, getMission } from '../../../services/service';
import { saveMission } from '../../missions/model/missions-slice';

type RequestStatus = 'idle' | 'pending' | 'fulfilled' | 'rejected';

type MissionDetailsState = {
    mission: Mission | null;
    missionId: number | null;
    status: RequestStatus;
    error: string | null;
    notFound: boolean;
    requestId: string | null;
    updatedAt: number | null;
};

const initialState: MissionDetailsState = {
    mission: null,
    missionId: null,
    status: 'idle',
    error: null,
    notFound: false,
    requestId: null,
    updatedAt: null,
};

export const fetchMissionDetails = createAsyncThunk<
    Mission,
    { id: number; force?: boolean },
    { state: RootState; rejectValue: { message: string; status: number | null } }
>(
    'missionDetails/fetch',
    async ({ id }, { rejectWithValue, signal }) => {
        try {
            return await getMission(id, signal);
        } catch (error) {
            if (signal.aborted) throw error;
            return rejectWithValue({
                message: error instanceof Error ? error.message : 'Mission details could not be loaded.',
                status: error instanceof ApiError ? error.status : null,
            });
        }
    },
    {
        condition: ({ id, force }, { getState }) => {
            const state = getState().missionDetails;

            if (state.status === 'pending' && state.missionId === id) return false;
            if (force || state.status !== 'fulfilled' || state.missionId !== id) return true;

            return Date.now() - (state.updatedAt ?? 0) >= MISSION_CACHE_TTL_MS;
        },
    },
);

const missionDetailsSlice = createSlice({
    name: 'missionDetails',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchMissionDetails.pending, (state, action) => {
                state.missionId = action.meta.arg.id;
                state.status = 'pending';
                state.error = null;
                state.notFound = false;
                state.requestId = action.meta.requestId;
            })
            .addCase(fetchMissionDetails.fulfilled, (state, action) => {
                if (state.requestId !== action.meta.requestId) return;

                state.mission = action.payload;
                state.missionId = action.payload.id;
                state.status = 'fulfilled';
                state.error = null;
                state.notFound = false;
                state.requestId = null;
                state.updatedAt = Date.now();
            })
            .addCase(fetchMissionDetails.rejected, (state, action) => {
                if (state.requestId !== action.meta.requestId) return;

                state.status = 'rejected';
                state.error = action.payload?.message ?? action.error.message ?? 'Mission details could not be loaded.';
                state.notFound = action.payload?.status === 404;
                state.requestId = null;
            })
            // Mutations return the updated mission, so the details view does not
            // need a second request to stay in sync.
            .addCase(saveMission.fulfilled, (state, action) => {
                const result = action.payload;

                if (result.type === 'delete') {
                    if (state.missionId !== result.id) return;
                    state.mission = null;
                    state.missionId = null;
                    state.status = 'idle';
                    state.error = null;
                    state.notFound = false;
                    state.updatedAt = null;
                    return;
                }

                if (result.mission && state.missionId === result.mission.id) {
                    state.mission = result.mission;
                    state.status = 'fulfilled';
                    state.error = null;
                    state.updatedAt = Date.now();
                }
            });
    },
});

export const selectMissionDetailsState = (state: RootState) => state.missionDetails;

export default missionDetailsSlice.reducer;
