import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { MissionPriority, MissionStatus } from '../../entities/mission/model/types';
import { useAppSelector } from '../../app/hooks';
import { selectDashboardAnalytics, selectDashboardTypes } from '../../features/dashboard/model/selectors';
import { useDashboardMissions } from '../../features/dashboard/model/use-dashboard-missions';
import { ErrorState, LoadingState } from '../../shared/ui/request-state/request-state';
import styles from './dashboard-page.module.scss';

type BreakdownItem = { key: string; label: string; count: number; to: string };

const BreakdownCard = ({ title, items }: { title: string; items: BreakdownItem[] }) => (
    <article className={styles.breakdown}>
        <h2>{title}</h2>
        {items.length ? (
            <ul>
                {items.map((item) => (
                    <li key={item.key}>
                        <Link to={item.to}>
                            <span>{item.label}</span>
                            <strong>{String(item.count).padStart(2, '0')}</strong>
                        </Link>
                    </li>
                ))}
            </ul>
        ) : (
            <p className={styles.empty}>No matching records.</p>
        )}
    </article>
);

export function DashboardPage() {
    const [status, setStatus] = useState<MissionStatus | 'all'>('all');
    const [priority, setPriority] = useState<MissionPriority | 'all'>('all');
    const [type, setType] = useState('all');
    const { isPending, isError, error, refetch } = useDashboardMissions();
    const types = useAppSelector(selectDashboardTypes);
    const filters = useMemo(() => ({ status, priority, type }), [status, priority, type]);
    const {
        total,
        active,
        completed,
        totalCrew,
        averageCrew,
        criticalPriority,
        statusBreakdown,
        priorityBreakdown,
        typeBreakdown,
        destinationBreakdown,
    } = useAppSelector((state) => selectDashboardAnalytics(state, filters));

    const filtersActive = status !== 'all' || priority !== 'all' || type !== 'all';

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div>
                    <p className={styles.eyebrow}>FLEET ANALYTICS / LIVE API DATA</p>
                    <h1>Mission dashboard</h1>
                    <p className={styles.lead}>
                        Operational statistics calculated from the full mission manifest. Narrow the fleet to update
                        every metric and breakdown below.
                    </p>
                </div>
                <Link className={styles.manifestLink} to='/missions'>
                    OPEN FULL MANIFEST →
                </Link>
            </header>

            {isPending ? (
                <LoadingState />
            ) : isError ? (
                <ErrorState
                    message={error instanceof Error ? error.message : 'The dashboard could not load mission analytics.'}
                    onRetry={() => void refetch()}
                />
            ) : (
                <>
                    <section className={styles.filterBar} aria-label='Dashboard filters'>
                        <label>
                            Status
                            <select
                                value={status}
                                onChange={(event) => setStatus(event.target.value as MissionStatus | 'all')}
                            >
                                <option value='all'>All statuses</option>
                                <option value='active'>Active</option>
                                <option value='completed'>Completed</option>
                            </select>
                        </label>
                        <label>
                            Priority
                            <select
                                value={priority}
                                onChange={(event) => setPriority(event.target.value as MissionPriority | 'all')}
                            >
                                <option value='all'>All priorities</option>
                                <option value='critical'>Critical</option>
                                <option value='high'>High</option>
                                <option value='medium'>Medium</option>
                                <option value='low'>Low</option>
                            </select>
                        </label>
                        <label>
                            Mission type
                            <select value={type} onChange={(event) => setType(event.target.value)}>
                                <option value='all'>All types</option>
                                {types.map((missionType) => (
                                    <option key={missionType} value={missionType}>
                                        {missionType.replaceAll('_', ' ')}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <button
                            type='button'
                            disabled={!filtersActive}
                            onClick={() => {
                                setStatus('all');
                                setPriority('all');
                                setType('all');
                            }}
                        >
                            RESET FILTERS
                        </button>
                    </section>

                    <section className={styles.stats}>
                        <Link to='/missions'>
                            <span>TOTAL MISSIONS</span>
                            <strong>{String(total).padStart(3, '0')}</strong>
                            <small>View full manifest</small>
                        </Link>
                        <Link to='/missions?status=active'>
                            <span>ACTIVE</span>
                            <strong>{String(active).padStart(3, '0')}</strong>
                            <small>In flight now</small>
                        </Link>
                        <Link to='/missions?status=completed'>
                            <span>COMPLETED</span>
                            <strong>{String(completed).padStart(3, '0')}</strong>
                            <small>Mission complete</small>
                        </Link>
                        <Link to='/missions?priority=critical'>
                            <span>CRITICAL PRIORITY</span>
                            <strong>{String(criticalPriority).padStart(3, '0')}</strong>
                            <small>Needs attention</small>
                        </Link>
                        <Link to='/missions'>
                            <span>TOTAL CREW</span>
                            <strong>{String(totalCrew).padStart(3, '0')}</strong>
                            <small>Avg {averageCrew} per mission</small>
                        </Link>
                    </section>

                    <section className={styles.breakdowns}>
                        <BreakdownCard title='Missions by status' items={statusBreakdown} />
                        <BreakdownCard title='Missions by priority' items={priorityBreakdown} />
                        <BreakdownCard title='Missions by type' items={typeBreakdown} />
                        <BreakdownCard title='Missions by destination' items={destinationBreakdown} />
                    </section>
                </>
            )}
        </div>
    );
}
