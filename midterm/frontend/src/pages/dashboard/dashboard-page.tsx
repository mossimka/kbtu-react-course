import { useEffect, useState } from 'react';
import { getMissions, deleteMission, updateMissionStatus } from '../../entities/mission/api/mission.api';
import type { MissionPriority, MissionStatus, Mission } from '../../entities/mission/model/types';
import { MissionFilters } from '../../features/mission-filters/mission-filters';
import { Header } from '../../widgets/header/header';
import { MissionList } from '../../widgets/mission-list/mission-list';
import { Pagination } from '../../shared/ui/pagination/pagination';
import { ErrorState, LoadingState, SuccessState } from '../../shared/ui/request-state/request-state';

export function DashboardPage() {
    const [missions, setMissions] = useState<Mission[]>([]);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<MissionStatus | 'all'>('all');
    const [priority, setPriority] = useState<MissionPriority | 'all'>('all');
    const [sortBy, setSortBy] = useState('launchDate');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const load = async (signal?: AbortSignal) => {
        setLoading(true);
        setError(null);
        try {
            const result = await getMissions(
                { search, status, priority, sortBy, sortDirection, page, size: 12 },
                signal,
            );
            setMissions(result.content);
            setTotalPages(result.totalPages);
            setTotalElements(result.totalElements);
        } catch (requestError) {
            if (requestError instanceof DOMException && requestError.name === 'AbortError') return;
            setError('The API could not load the mission manifest.');
        } finally {
            if (!signal?.aborted) setLoading(false);
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        void load(controller.signal);
        return () => controller.abort();
    }, [search, status, priority, sortBy, sortDirection, page]);

    useEffect(() => {
        setPage(0);
    }, [search, status, priority, sortBy, sortDirection]);

    const reset = () => {
        setSearch('');
        setStatus('all');
        setPriority('all');
        setSortBy('launchDate');
        setSortDirection('asc');
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteMission(id);
            setMessage('Mission deleted successfully.');
            window.setTimeout(() => setMessage(null), 3000);
            await load();
        } catch {
            setError('Mission deletion failed. Please try again.');
        }
    };

    const handleStatusChange = async (id: number, nextStatus: MissionStatus) => {
        try {
            await updateMissionStatus(id, nextStatus);
            setMessage('Mission status updated.');
            window.setTimeout(() => setMessage(null), 3000);
            await load();
        } catch {
            setError('Status update failed. Please try again.');
        }
    };

    return (
        <main className='dashboard-shell'>
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
                    onSearchChange={setSearch}
                    onStatusChange={setStatus}
                    onPriorityChange={setPriority}
                    onSortChange={setSortBy}
                    onDirectionChange={() => setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))}
                    onReset={reset}
                />
                {message && <SuccessState message={message} />}
                {loading ? (
                    <LoadingState />
                ) : error ? (
                    <ErrorState message={error} onRetry={() => void load()} />
                ) : (
                    <>
                        <MissionList missions={missions} onDelete={handleDelete} onStatusChange={handleStatusChange} />
                        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
                    </>
                )}
            </section>
        </main>
    );
}
