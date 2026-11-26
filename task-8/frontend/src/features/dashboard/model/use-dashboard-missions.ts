import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { fetchDashboardMissions, selectDashboardState } from './dashboard-slice';

export function useDashboardMissions() {
    const dispatch = useAppDispatch();
    const state = useAppSelector(selectDashboardState);

    useEffect(() => {
        void dispatch(fetchDashboardMissions({}));
    }, [dispatch]);

    return {
        data: state.missions,
        isPending: state.status === 'idle' || state.status === 'pending',
        isError: state.status === 'rejected',
        error: state.error ? new Error(state.error) : null,
        refetch: () => void dispatch(fetchDashboardMissions({ force: true })),
    };
}
