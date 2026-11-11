export type MissionStatus = 'active' | 'completed';
export type MissionPriority = 'critical' | 'high' | 'medium' | 'low';

export type Mission = {
    id: number;
    name: string;
    destination: string;
    type: string;
    status: MissionStatus;
    priority: MissionPriority;
    crew: number;
    description?: string;
    launchDate?: string;
    createdAt?: string;
};

export type MissionInput = Omit<Mission, 'id' | 'createdAt'>;

export type MissionPage = {
    content: Mission[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first?: boolean;
    last?: boolean;
};
