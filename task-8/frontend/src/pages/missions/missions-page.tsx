import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { MissionPriority, MissionStatus } from '../../entities/mission/model/types';
import { useAuth } from '../../features/auth/auth-context';
import { MissionFilters } from '../../features/mission-filters/mission-filters';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
    clearMissionMutationError,
    saveMission,
    selectMissionMutation,
    selectMissionSummary,
} from '../../features/missions/model/missions-slice';
import { useMissions } from '../../features/missions/model/use-missions';
import type { MissionQuery } from '../../services/service';
import { useDebouncedValue } from '../../shared/lib/use-debounced-value';
import { EmptyState } from '../../shared/ui/empty-state/empty-state';
import { Pagination } from '../../shared/ui/pagination/pagination';
import { ErrorState, LoadingState, SuccessState } from '../../shared/ui/request-state/request-state';
import { Header } from '../../widgets/header/header';
import { MissionList } from '../../widgets/mission-list/mission-list';
import styles from './missions-page.module.scss';

const PAGE_SIZE = 12;
const SORT_FIELDS = ['launchDate', 'name', 'crew', 'priority'];

const parseStatus = (value: string | null): MissionStatus | 'all' =>
    value === 'active' || value === 'completed' ? value : 'all';

const parsePriority = (value: string | null): MissionPriority | 'all' =>
    value === 'critical' || value === 'high' || value === 'medium' || value === 'low' ? value : 'all';

const parseSort = (value: string | null) => (value && SORT_FIELDS.includes(value) ? value : 'launchDate');

const parseDirection = (value: string | null): 'asc' | 'desc' => (value === 'desc' ? 'desc' : 'asc');

const parsePage = (value: string | null) => {
    const page = Number(value ?? '1');
    return Number.isFinite(page) && page > 0 ? Math.floor(page) - 1 : 0;
};

export function MissionsPage() {
    const { user } = useAuth();
    const dispatch = useAppDispatch();
    const [searchParams, setSearchParams] = useSearchParams();

    const search = searchParams.get('search') ?? '';
    const status = parseStatus(searchParams.get('status'));
    const priority = parsePriority(searchParams.get('priority'));
    const sortBy = parseSort(searchParams.get('sortBy'));
    const sortDirection = parseDirection(searchParams.get('direction') ?? searchParams.get('sortDirection'));
    const page = parsePage(searchParams.get('page'));

    // Search is typed locally and written to the URL after a short delay, so
    // every keystroke does not trigger a request.
    const [searchInput, setSearchInput] = useState(search);
    const debouncedSearch = useDebouncedValue(searchInput, 300);
    const lastPushedSearch = useRef(search);

    useEffect(() => {
        // Reset, back/forward or a link changed the URL search parameter.
        if (search === lastPushedSearch.current) return;
        lastPushedSearch.current = search;
        setSearchInput(search);
    }, [search]);

    useEffect(() => {
        if (debouncedSearch === lastPushedSearch.current) return;

        lastPushedSearch.current = debouncedSearch;
        setSearchParams(
            (current) => {
                const next = new URLSearchParams(current);
                if (debouncedSearch.trim()) next.set('search', debouncedSearch);
                else next.delete('search');
                next.delete('page');
                return next;
            },
            { replace: true },
        );
    }, [debouncedSearch, setSearchParams]);

    const resetFilters = () => {
        lastPushedSearch.current = '';
        setSearchInput('');
        setSearchParams({});
    };

    const [message, setMessage] = useState<string | null>(null);
    const [retryOperation, setRetryOperation] = useState<
        { type: 'delete'; id: number } | { type: 'status'; id: number; status: MissionStatus } | null
    >(null);
    const mutationError = useAppSelector(selectMissionMutation).error;
    const summary = useAppSelector(selectMissionSummary);
    const query: MissionQuery = { search, status, priority, sortBy, sortDirection, page, size: PAGE_SIZE };
    const { data, isPending, isError, error, refetch } = useMissions(query);
    const missions = data?.content ?? [];
    const totalPages = data?.totalPages ?? 0;

    const updateParam = (key: string, value: string) => {
        setSearchParams((current) => {
            const next = new URLSearchParams(current);
            if (!value || value === 'all') next.delete(key);
            else next.set(key, value);
            if (key !== 'page') next.delete('page');
            return next;
        });
    };

    const showMessage = (text: string) => {
        setMessage(text);
        window.setTimeout(() => setMessage(null), 3000);
    };

    const handleDelete = async (id: number) => {
        setRetryOperation({ type: 'delete', id });
        const result = await dispatch(saveMission({ type: 'delete', id }));
        if (saveMission.fulfilled.match(result)) {
            setRetryOperation(null);
            showMessage('Mission deleted successfully.');
        }
    };

    const handleStatusChange = async (id: number, nextStatus: MissionStatus) => {
        setRetryOperation({ type: 'status', id, status: nextStatus });
        const result = await dispatch(saveMission({ type: 'status', id, status: nextStatus }));
        if (saveMission.fulfilled.match(result)) {
            setRetryOperation(null);
            showMessage('Mission status updated.');
        }
    };

    const retryMutation = () => {
        if (retryOperation?.type === 'delete') void handleDelete(retryOperation.id);
        if (retryOperation?.type === 'status') void handleStatusChange(retryOperation.id, retryOperation.status);
    };

    return (
        <>
            <Header total={summary.total} active={summary.active} completed={summary.completed} />
            <section className='dashboard-content'>
                <MissionFilters
                    search={searchInput}
                    status={status}
                    priority={priority}
                    sortBy={sortBy}
                    sortDirection={sortDirection}
                    onSearchChange={setSearchInput}
                    onStatusChange={(value) => updateParam('status', value)}
                    onPriorityChange={(value) => updateParam('priority', value)}
                    onSortChange={(value) => updateParam('sortBy', value)}
                    onDirectionChange={() => updateParam('direction', sortDirection === 'asc' ? 'desc' : 'asc')}
                    onReset={resetFilters}
                />

                {message && <SuccessState message={message} />}
                {mutationError && (
                    <ErrorState
                        message={mutationError}
                        onRetry={retryOperation ? retryMutation : () => dispatch(clearMissionMutationError())}
                    />
                )}

                {isPending ? (
                    <LoadingState />
                ) : isError ? (
                    <ErrorState
                        message={
                            error instanceof Error ? error.message : 'The API could not load the mission manifest.'
                        }
                        onRetry={refetch}
                    />
                ) : (
                    <>
                        <div className={styles.summary}>
                            <span>
                                {summary.total} MISSION{summary.total === 1 ? '' : 'S'} MATCHING CURRENT QUERY
                            </span>
                            <span>
                                PAGE {totalPages === 0 ? 0 : page + 1} / {totalPages}
                            </span>
                        </div>
                        {missions.length ? (
                            <MissionList
                                missions={missions}
                                canManage={Boolean(user)}
                                onDelete={(id) => void handleDelete(id)}
                                onStatusChange={(id, nextStatus) => void handleStatusChange(id, nextStatus)}
                            />
                        ) : (
                            <EmptyState />
                        )}
                        <Pagination
                            page={page}
                            totalPages={totalPages}
                            onChange={(nextPage) => updateParam('page', String(nextPage + 1))}
                        />
                    </>
                )}
            </section>
        </>
    );
}
