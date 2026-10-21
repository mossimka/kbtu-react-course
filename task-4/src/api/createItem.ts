import { readItems, writeItems } from './storage';
import { request } from './request';
import type { Item, ItemDraft } from '../types';

export function createItem(draft: ItemDraft) {
    return request<Item>(() => {
        const item: Item = {
            ...draft,
            id: `${draft.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')}-${Date.now()}`,
            tags: [draft.category.toLowerCase(), 'new'],
            lastUpdated: new Date().toISOString().slice(0, 10),
        };
        writeItems([item, ...readItems()]);
        return item;
    });
}
