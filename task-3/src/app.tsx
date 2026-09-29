import { useState } from 'react';
import { Header } from './components/header/header.component';
import { MissionControls } from './components/mission-controls/mission-controls.component';
import { MissionList } from './components/mission-list/mission-list.component';
import { initialMissions } from './data/missions';
import type { Mission, MissionPriority } from './data/missions';
import './index.css';

function App() {
    const [missions, setMissions] = useState(initialMissions);
    const [filter, setFilter] = useState('all');
    const [reverse, setReverse] = useState(false);
    const [resetVersion, setResetVersion] = useState(0);

    const filteredMissions = missions.filter((mission) => {
        if (filter === 'all') return true;
        if (filter === 'critical') return mission.priority === filter;
        return mission.status === filter;
    });

const visibleMissions = reverse ? [...filteredMissions].reverse() : filteredMissions;
    const activeCount = missions.filter((mission) => mission.status === 'active').length;
    const completedCount = missions.filter((mission) => mission.status === 'completed').length;

    const handleStatusChange = (id: number, status: Mission['status']) => {
        setMissions((current) => current.map((mission) => (mission.id === id ? { ...mission, status } : mission)));
    };

    const handleDelete = (id: number) => {
        setMissions((current) => current.filter((mission) => mission.id !== id));
    };

    const handleAdd = (name: string, destination: string, priority: MissionPriority) => {
        setMissions((current) => [
            ...current,
            {
                id: Date.now(),
                name,
                destination,
                priority,
                type: 'Exploration',
                status: 'active',
                crew: 4,
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
