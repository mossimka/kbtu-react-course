import { readItems } from './storage';
import { request } from './request';
import type { Item } from '../types';

export function getItem(id: string) {
    return request<Item>(() => {
        const item = readItems().find((candidate) => candidate.id === id);
        if (!item) throw new Error('This item no longer exists.');
        return item;
    });
}
