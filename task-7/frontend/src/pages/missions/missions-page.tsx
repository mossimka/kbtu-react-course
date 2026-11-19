import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { MissionPriority, MissionStatus } from '../../entities/mission/model/types';
import { useAuth } from '../../features/auth/auth-context';
import { MissionFilters } from '../../features/mission-filters/mission-filters';
import { deleteMission, getMissions, updateMissionStatus, type MissionQuery } from '../../services/service';
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
    const [searchParams, setSearchParams] = useSearchParams();

    const search = searchParams.get('search') ?? '';
    const status = parseStatus(searchParams.get('status'));
    const priority = parsePriority(searchParams.get('priority'));
    const sortBy = parseSort(searchParams.get('sortBy'));
    const sortDirection = parseDirection(searchParams.get('direction') ?? searchParams.get('sortDirection'));
    const page = parsePage(searchParams.get('page'));

    const [message, setMessage] = useState<string | null>(null);
    const [mutationError, setMutationError] = useState<string | null>(null);
    const query: MissionQuery = { search, status, priority, sortBy, sortDirection, page, size: PAGE_SIZE };
    const {
        data,
        isLoading: loading,
        isError,
        refetch,
    } = useQuery({
        queryKey: ['missions', query],
        queryFn: ({ signal }) => getMissions(query, signal),
    });
    const missions = data?.content ?? [];
    const totalPages = data?.totalPages ?? 0;
    const totalElements = data?.totalElements ?? 0;

    const updateParam = (key: string, value: string) => {
        setSearchParams((current) => {
            const next = new URLSearchParams(current);
            if (!value || value === 'all') next.delete(key);
            else next.set(key, value);
            if (key !== 'page') next.delete('page');
            return next;
        });
    };

    const updateSearch = (value: string) => {
        setSearchParams(
            (current) => {
                const next = new URLSearchParams(current);
                if (value.trim()) next.set('search', value);
                else next.delete('search');
                next.delete('page');
                return next;
            },
            { replace: true },
        );
    };

    const showMessage = (text: string) => {
        setMessage(text);
        window.setTimeout(() => setMessage(null), 3000);
    };

    const handleDelete = async (id: number) => {
        try {
            setMutationError(null);
            await deleteMission(id);
            showMessage('Mission deleted successfully.');
        } catch {
            setMutationError('Mission deletion failed. Please try again.');
        }
    };

    const handleStatusChange = async (id: number, nextStatus: MissionStatus) => {
        try {
            setMutationError(null);
            await updateMissionStatus(id, nextStatus);
            showMessage('Mission status updated.');
        } catch {
            setMutationError('Status update failed. Please try again.');
        }
    };

    return (
        <>
            <Header
                total={totalElements}
                active={missions.filter((mission) => mission.status === 'active').length}
                completed={missions.filter((mission) => mission.status === 'completed').length}
            />
            <section className='dashboard-content'>
                <MissionFilters
                    search={search}
                    status={status}
                    priority={priority}
                    sortBy={sortBy}
                    sortDirection={sortDirection}
                    onSearchChange={updateSearch}
                    onStatusChange={(value) => updateParam('status', value)}
                    onPriorityChange={(value) => updateParam('priority', value)}
                    onSortChange={(value) => updateParam('sortBy', value)}
                    onDirectionChange={() => updateParam('direction', sortDirection === 'asc' ? 'desc' : 'asc')}
                    onReset={() => setSearchParams({})}
                />

                {message && <SuccessState message={message} />}
                {mutationError && <ErrorState message={mutationError} onRetry={() => setMutationError(null)} />}

                {loading ? (
                    <LoadingState />
                ) : isError ? (
                    <ErrorState message='The API could not load the mission manifest.' onRetry={() => void refetch()} />
                ) : (
                    <>
                        <div className={styles.summary}>
                            <span>
                                {totalElements} MISSION{totalElements === 1 ? '' : 'S'} MATCHING CURRENT QUERY
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
