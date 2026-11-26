import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { fetchMissionDetails, selectMissionDetailsState } from './mission-details-slice';

export function useMissionDetails(id: number | null) {
    const dispatch = useAppDispatch();
    const state = useAppSelector(selectMissionDetailsState);

    useEffect(() => {
        if (id !== null) void dispatch(fetchMissionDetails({ id }));
    }, [dispatch, id]);

    const matches = id !== null && state.missionId === id;

    return {
        missionId: id,
        mission: matches ? state.mission : null,
        status:
            id === null
                ? ('idle' as const)
                : !matches || state.status === 'pending'
                  ? ('pending' as const)
                  : state.status,
        error: matches ? state.error : null,
        notFound: matches && state.notFound,
        retry: () => {
            if (id !== null) void dispatch(fetchMissionDetails({ id, force: true }));
        },
    };
}
