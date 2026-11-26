import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer from '../features/dashboard/model/dashboard-slice';
import missionDetailsReducer from '../features/mission-details/model/mission-details-slice';
import missionsReducer from '../features/missions/model/missions-slice';

export const store = configureStore({
    reducer: {
        missions: missionsReducer,
        missionDetails: missionDetailsReducer,
        dashboard: dashboardReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
