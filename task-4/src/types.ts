export type Status = 'Available' | 'In use' | 'Maintenance';
export type Priority = 'Low' | 'Medium' | 'High';

export type Item = {
    id: string;
    name: string;
    category: string;
    description: string;
    status: Status;
    priority: Priority;
    owner: string;
    location: string;
    tags: string[];
    lastUpdated: string;
};

export type ItemDraft = Pick<Item, 'name' | 'category' | 'description' | 'status' | 'priority' | 'owner' | 'location'>;

export type ListItem = Pick<Item, 'id' | 'name' | 'category' | 'status' | 'priority'>;

export const emptyDraft: ItemDraft = {
    name: '',
    category: 'Workspace',
    description: '',
    status: 'Available',
    priority: 'Medium',
    owner: '',
    location: '',
};
