import { useState } from 'react';
import type { SubmitEvent } from 'react';
import type { MissionPriority } from '../../data/missions';
import styles from './mission-controls.module.scss';

type MissionControlsProps = {
    filter: string;
    onFilterChange: (filter: string) => void;
    reverse: boolean;
    onReverse: () => void;
    onAdd: (name: string, destination: string, priority: MissionPriority) => void;
};

export const MissionControls = ({ filter, onFilterChange, reverse, onReverse, onAdd }: MissionControlsProps) => {
    const [name, setName] = useState('');
    const [destination, setDestination] = useState('');
    const [priority, setPriority] = useState<MissionPriority>('medium');

    const submit = (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!name.trim() || !destination.trim()) return;
        onAdd(name.trim(), destination.trim(), priority);
        setName('');
        setDestination('');
    };

    return (
        <section className={styles.root}>
            <div className={styles.filters}>
                {['all', 'active', 'completed', 'critical'].map((option) => (
                    <button
                        className={filter === option ? styles.selected : ''}
                        key={option}
                        onClick={() => onFilterChange(option)}
                    >
                        {option}
                    </button>
                ))}
            </div>
            <button className={styles.reverse} onClick={onReverse}>
                {reverse ? '↑' : '↓'} REVERSE ORDER
            </button>
            <form className={styles.form} onSubmit={submit}>
                <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder='Mission name'
                    aria-label='Mission name'
                />
                <input
                    value={destination}
                    onChange={(event) => setDestination(event.target.value)}
                    placeholder='Destination'
                    aria-label='Destination'
                />
                <select
                    value={priority}
                    onChange={(event) => setPriority(event.target.value as MissionPriority)}
                    aria-label='Priority'
                >
                    <option value='critical'>Critical</option>
                    <option value='high'>High</option>
                    <option value='medium'>Medium</option>
                    <option value='low'>Low</option>
                </select>
                <button type='submit'>+ LAUNCH MISSION</button>
            </form>
        </section>
    );
};
