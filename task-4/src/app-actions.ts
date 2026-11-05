import { createItem, removeItem, updateItem } from './api'
import type { Item, ItemDraft } from './types'

export function getItemDraft(item: Item): ItemDraft {
    return {
        name: item.name,
        category: item.category,
        description: item.description,
        status: item.status,
        priority: item.priority,
        owner: item.owner,
        location: item.location,
    }
}

export function saveItem(editingId: string | null, draft: ItemDraft) {
    if (editingId === null) {
        return Promise.reject(new Error('No item is selected for saving.'))
    }

    return editingId === 'new' ? createItem(draft) : updateItem(editingId, draft)
}

export function removeSelectedItem(id: string) {
    return removeItem(id)
}

export function markItemAvailable(id: string) {
    return updateItem(id, { status: 'Available' })
}
