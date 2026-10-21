import type { Item } from '../types';

export const STORAGE_KEY = 'async-inventory-items';

export const seedItems: Item[] = [
    {
        id: 'camera-kit',
        name: 'Camera kit',
        category: 'Production',
        description: 'Mirrorless camera, two lenses, tripod, and spare batteries.',
        status: 'Available',
        priority: 'High',
        owner: 'Media team',
        location: 'Studio A',
        tags: ['video', 'equipment'],
        lastUpdated: '2026-10-18',
    },
    {
        id: 'meeting-room',
        name: 'Meeting room Alpha',
        category: 'Workspace',
        description: 'Bright 8-seat room with video conferencing and whiteboard.',
        status: 'In use',
        priority: 'Medium',
        owner: 'Operations',
        location: 'Main building, 2nd floor',
        tags: ['room', 'hybrid'],
        lastUpdated: '2026-10-20',
    },
    {
        id: 'design-tablet',
        name: 'Design tablet',
        category: 'Hardware',
        description: 'Pressure-sensitive tablet prepared for the product design team.',
        status: 'Maintenance',
        priority: 'Low',
        owner: 'Design team',
        location: 'Workshop 3',
        tags: ['design', 'hardware'],
        lastUpdated: '2026-10-15',
    },
];

export function readItems(): Item[] {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedItems));
        return seedItems;
    }
    try {
        return JSON.parse(saved) as Item[];
    } catch {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedItems));
        return seedItems;
    }
}

export function writeItems(items: Item[]) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}
