export type MissionStatus = 'active' | 'completed' | 'paused';
export type MissionPriority = 'critical' | 'high' | 'medium' | 'low';

export type Mission = {
    id: number;
    name: string;
    destination: string;
    type: string;
    status: MissionStatus;
    priority: MissionPriority;
    crew: number;
};

export const initialMissions: Mission[] = [
    {
        id: 1,
        name: 'Artemis IX',
        destination: 'Moon',
        type: 'Lunar Expedition',
        status: 'active',
        priority: 'critical',
        crew: 4,
    },
    {
        id: 2,
        name: 'Europa Survey',
        destination: 'Jupiter',
        type: 'Research',
        status: 'active',
        priority: 'high',
        crew: 6,
    },
    {
        id: 3,
        name: 'Ares Pathfinder',
        destination: 'Mars',
        type: 'Mars Expedition',
        status: 'completed',
        priority: 'medium',
        crew: 5,
    },
    {
        id: 4,
        name: 'Kepler Deep Field',
        destination: 'Kepler-186',
        type: 'Deep Space Survey',
        status: 'active',
        priority: 'medium',
        crew: 3,
    },
    {
        id: 5,
        name: 'Titan Horizon',
        destination: 'Titan',
        type: 'Atmospheric Research',
        status: 'paused',
        priority: 'high',
        crew: 4,
    },
    {
        id: 6,
        name: 'Comet Hunter',
        destination: '67P/Churyumov–Gerasimenko',
        type: 'Comet Survey',
        status: 'completed',
        priority: 'low',
        crew: 2,
    },
    {
        id: 7,
        name: 'Solaris Probe',
        destination: 'Solar Orbit',
        type: 'Solar Research',
        status: 'active',
        priority: 'critical',
        crew: 3,
    },
    {
        id: 8,
        name: 'Neptune Watch',
        destination: 'Neptune',
        type: 'Outer Planet Survey',
        status: 'paused',
        priority: 'medium',
        crew: 5,
    },
];
