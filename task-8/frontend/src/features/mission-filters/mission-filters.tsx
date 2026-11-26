import { Link } from 'react-router-dom';
import type { MissionPriority, MissionStatus } from '../../entities/mission/model/types';
import styles from './mission-filters.module.scss';

type MissionFiltersProps = {
    search: string;
    status: MissionStatus | 'all';
    priority: MissionPriority | 'all';
    sortBy: string;
    sortDirection: 'asc' | 'desc';
    onSearchChange: (value: string) => void;
    onStatusChange: (value: MissionStatus | 'all') => void;
    onPriorityChange: (value: MissionPriority | 'all') => void;
    onSortChange: (value: string) => void;
    onDirectionChange: () => void;
    onReset: () => void;
};

export const MissionFilters = ({
    search,
    status,
    priority,
    sortBy,
    sortDirection,
    onSearchChange,
    onStatusChange,
    onPriorityChange,
    onSortChange,
    onDirectionChange,
    onReset,
}: MissionFiltersProps) => (
    <section className={styles.root}>
        <div className={styles.filters}>
            <input
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder='Search name, destination, type'
                aria-label='Search missions'
            />
            <select value={status} onChange={(event) => onStatusChange(event.target.value as MissionStatus | 'all')}>
                <option value='all'>All statuses</option>
                <option value='active'>Active</option>
                <option value='completed'>Completed</option>
            </select>
            <select
                value={priority}
                onChange={(event) => onPriorityChange(event.target.value as MissionPriority | 'all')}
            >
                <option value='all'>All priorities</option>
                <option value='critical'>Critical</option>
                <option value='high'>High</option>
                <option value='medium'>Medium</option>
                <option value='low'>Low</option>
            </select>
            <select value={sortBy} onChange={(event) => onSortChange(event.target.value)}>
                <option value='launchDate'>Launch date</option>
                <option value='name'>Name</option>
                <option value='crew'>Crew size</option>
                <option value='priority'>Priority</option>
            </select>
            <button onClick={onDirectionChange}>{sortDirection === 'asc' ? '↑' : '↓'} SORT</button>
            <button onClick={onReset}>RESET</button>
        </div>
        <Link className={styles.create} to='/missions/new'>
            + LAUNCH MISSION
        </Link>
    </section>
);
