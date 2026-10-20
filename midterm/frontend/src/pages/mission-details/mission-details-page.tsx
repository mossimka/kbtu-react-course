import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getMission } from '../../entities/mission/api/mission.api';
import type { Mission } from '../../entities/mission/model/types';
import { ErrorState, LoadingState } from '../../shared/ui/request-state/request-state';

export function MissionDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [mission, setMission] = useState<Mission | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        void getMission(Number(id), controller.signal)
            .then(setMission)
            .catch((requestError: unknown) => {
                if (!(requestError instanceof DOMException && requestError.name === 'AbortError')) {
                    setError('Mission details could not be loaded.');
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        return () => controller.abort();
    }, [id]);

    if (loading) return <main className='dashboard-shell'><section className='dashboard-content'><LoadingState /></section></main>;
    if (error || !mission) return <main className='dashboard-shell'><section className='dashboard-content'><ErrorState message={error ?? 'Mission not found.'} onRetry={() => navigate(0)} /></section></main>;

    return (
        <main className='dashboard-shell'>
            <section className='dashboard-content detail-page'>
                <Link to='/' className='back-link'>← BACK TO MANIFEST</Link>
                <p className='eyebrow'>MISSION RECORD / #{mission.id}</p>
                <h1>{mission.name}</h1>
                <div className='detail-grid'>
                    <div><span>DESTINATION</span><strong>{mission.destination}</strong></div>
                    <div><span>TYPE</span><strong>{mission.type}</strong></div>
                    <div><span>STATUS</span><strong>{mission.status}</strong></div>
                    <div><span>PRIORITY</span><strong>{mission.priority}</strong></div>
                    <div><span>CREW</span><strong>{mission.crew}</strong></div>
                    <div><span>LAUNCH DATE</span><strong>{mission.launchDate ?? '—'}</strong></div>
                </div>
                <p className='description'>{mission.description || 'No mission briefing was provided.'}</p>
            </section>
        </main>
    );
}
