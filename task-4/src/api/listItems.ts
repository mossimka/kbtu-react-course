import { readItems } from './storage';
import { request } from './request';
import type { ListItem } from '../types';

export function listItems() {
    return request<ListItem[]>(() =>
        readItems().map(({ id, name, category, status, priority }) => ({ id, name, category, status, priority })),
    );
}
