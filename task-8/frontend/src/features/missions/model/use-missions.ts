import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import type { MissionQuery } from '../../../services/service';
import { fetchMissions, selectMissionsState } from './missions-slice';

/**
 * Reads the mission list from Redux and requests it when the query changes.
 * The thunk itself decides whether the cached page is still fresh.
 */
export function useMissions(query: MissionQuery) {
    const dispatch = useAppDispatch();
    const state = useAppSelector(selectMissionsState);
    const key = JSON.stringify(query);
    const currentQuery = useMemo(() => JSON.parse(key) as MissionQuery, [key]);

    useEffect(() => {
        void dispatch(fetchMissions({ query: currentQuery }));
    }, [dispatch, currentQuery]);

    const matches = state.queryKey === key;

    return {
        data: matches
            ? {
                  content: state.items,
                  page: state.page,
                  size: state.size,
                  totalElements: state.totalElements,
                  totalPages: state.totalPages,
              }
            : undefined,
        isPending: !matches || state.status === 'pending',
        isError: matches && state.status === 'rejected',
        error: matches && state.error ? new Error(state.error) : null,
        retry: () => void dispatch(fetchMissions({ query: currentQuery, force: true })),
        refetch: () => void dispatch(fetchMissions({ query: currentQuery, force: true })),
    };
}
