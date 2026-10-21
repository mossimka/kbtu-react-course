import { readItems, writeItems } from './storage';
import { request } from './request';

export function removeItem(id: string) {
    return request<void>(() => {
        writeItems(readItems().filter((item) => item.id !== id));
    });
}
