import { useState } from 'react';
import { Header } from './components/header/header.component';
import { MissionControls } from './components/mission-controls/mission-controls.component';
import { MissionList } from './components/mission-list/mission-list.component';
import { initialMissions } from './data/missions';
import type { Mission, MissionPriority } from './data/missions';
import {
    type MissionFilter,
    DEFAULT_CREW_SIZE,
    DEFAULT_MISSION_TYPE,
    FILTER,
    INITIAL_RESET_VERSION,
    STATUS,
} from './config/mission.config';
import './index.scss';

function App() {
    const [missions, setMissions] = useState(initialMissions);

    const [filter, setFilter] = useState<MissionFilter>(FILTER.ALL);

    const [reverse, setReverse] = useState(false);

    const [resetVersion, setResetVersion] = useState(INITIAL_RESET_VERSION);

    const filteredMissions = missions.filter((mission) => {
        if (filter === FILTER.ALL) return true;
        if (filter === FILTER.CRITICAL) return mission.priority === 'critical';
        return mission.status === filter;
    });

    const visibleMissions = reverse ? [...filteredMissions].reverse() : filteredMissions;

    const activeCount = missions.filter((m) => m.status === STATUS.ACTIVE).length;
    const completedCount = missions.filter((m) => m.status === STATUS.COMPLETED).length;

    const handleStatusChange = (id: number, status: Mission['status']) => {
        setMissions((current) => current.map((m) => (m.id === id ? { ...m, status } : m)));
    };

    const handleDelete = (id: number) => {
        setMissions((current) => current.filter((m) => m.id !== id));
    };

    const handleAdd = (name: string, destination: string, priority: MissionPriority) => {
        setMissions((current) => [
            ...current,
            {
                id: Date.now(),
                name,
                destination,
                priority,
                type: DEFAULT_MISSION_TYPE,
                status: STATUS.ACTIVE,
                crew: DEFAULT_CREW_SIZE,
            },
        ]);
    };

    return (
        <main className='dashboard-shell'>
            <Header total={missions.length} active={activeCount} completed={completedCount} />
            <section className='dashboard-content'>
                <MissionControls
                    filter={filter}
                    onFilterChange={setFilter}
                    reverse={reverse}
                    onReverse={() => setReverse((current) => !current)}
                    onAdd={handleAdd}
                />
                <MissionList
                    missions={visibleMissions}
                    resetVersion={resetVersion}
                    onResetAll={() => setResetVersion((current) => current + 1)}
                    onDelete={handleDelete}
                    onStatusChange={handleStatusChange}
                />
            </section>
        </main>
    );
}

export default App;
