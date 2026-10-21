import { readItems, writeItems } from './storage';
import { request } from './request';
import type { Item } from '../types';

export function updateItem(id: string, changes: Partial<Item>) {
    return request<Item>(() => {
        const items = readItems();
        const index = items.findIndex((item) => item.id === id);
        if (index === -1) throw new Error('This item no longer exists.');
        const updated = { ...items[index], ...changes, lastUpdated: new Date().toISOString().slice(0, 10) };
        items[index] = updated;
        writeItems(items);
        return updated;
    });
}
