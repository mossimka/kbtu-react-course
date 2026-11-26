import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../../../app/store';
import type { Mission } from '../../../entities/mission/model/types';
import { MISSION_CACHE_TTL_MS } from '../../../shared/configs/mission.config';
import { getAllMissions } from '../../../services/service';

type RequestStatus = 'idle' | 'pending' | 'fulfilled' | 'rejected';

type DashboardState = {
    missions: Mission[];
    status: RequestStatus;
    error: string | null;
    requestId: string | null;
    updatedAt: number | null;
};

const initialState: DashboardState = {
    missions: [],
    status: 'idle',
    error: null,
    requestId: null,
    updatedAt: null,
};

export const fetchDashboardMissions = createAsyncThunk<
    Mission[],
    { force?: boolean },
    { state: RootState; rejectValue: string }
>(
    'dashboard/fetch',
    async (_arg, { rejectWithValue, signal }) => {
        try {
            return await getAllMissions(signal);
        } catch (error) {
            if (signal.aborted) throw error;
            return rejectWithValue(
                error instanceof Error ? error.message : 'The dashboard could not load mission analytics.',
            );
        }
    },
    {
        condition: ({ force }, { getState }) => {
            const state = getState().dashboard;

            if (state.status === 'pending') return false;
            if (force || state.status !== 'fulfilled') return true;

            return Date.now() - (state.updatedAt ?? 0) >= MISSION_CACHE_TTL_MS;
        },
    },
);

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboardMissions.pending, (state, action) => {
                state.status = 'pending';
                state.error = null;
                state.requestId = action.meta.requestId;
            })
            .addCase(fetchDashboardMissions.fulfilled, (state, action) => {
                if (state.requestId !== action.meta.requestId) return;

                state.missions = action.payload;
                state.status = 'fulfilled';
                state.error = null;
                state.requestId = null;
                state.updatedAt = Date.now();
            })
            .addCase(fetchDashboardMissions.rejected, (state, action) => {
                if (state.requestId !== action.meta.requestId) return;

                state.status = 'rejected';
                state.error =
                    action.payload ?? action.error.message ?? 'The dashboard could not load mission analytics.';
                state.requestId = null;
            });
    },
});

export const selectDashboardState = (state: RootState) => state.dashboard;

export default dashboardSlice.reducer;
