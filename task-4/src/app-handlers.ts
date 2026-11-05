import type { Dispatch, FormEvent, SetStateAction } from 'react';
import {
    getItemDraft,
    markItemAvailable,
    removeSelectedItem,
    saveItem as saveItemRequest,
} from './app-actions';
import type { Item, ItemDraft, ListItem } from './types';
import { emptyDraft } from './types';

type AppHandlersContext = {
    selectedId: string | null;
    details: Item | null;
    editingId: string | null;
    draft: ItemDraft;
    completingId: string | null;
    setNotice: (value: string) => void;
    setError: (value: string) => void;
    setListState: (value: 'loading' | 'success' | 'error') => void;
    setDetails: (value: Item | null) => void;
    setDetailsError: (value: string) => void;
    setDetailsState: (value: 'idle' | 'loading' | 'success' | 'error') => void;
    setSelectedId: (value: string | null) => void;
    setDetailsReloadKey: Dispatch<SetStateAction<number>>;
    setEditingId: (value: string | null) => void;
    setDraft: (value: ItemDraft) => void;
    setSaving: (value: boolean) => void;
    setRemovingId: (value: string | null) => void;
    setCompletingId: (value: string | null) => void;
    setItems: Dispatch<SetStateAction<ListItem[]>>;
    setReloadKey: Dispatch<SetStateAction<number>>;
};

export function createAppHandlers(context: AppHandlersContext) {
    const refresh = () => {
        context.setNotice('');
        context.setError('');
        context.setListState('loading');
        context.setReloadKey((key) => key + 1);
    };

    const selectItem = (id: string) => {
        context.setNotice('');
        context.setDetails(null);
        context.setDetailsError('');
        context.setDetailsState('loading');
        context.setSelectedId(id);
        context.setDetailsReloadKey((key) => key + 1);
    };

    const startCreate = () => {
        context.setEditingId('new');
        context.setDraft(emptyDraft);
    };

    const startEdit = () => {
        if (context.details) {
            context.setEditingId(context.details.id);
            context.setDraft(getItemDraft(context.details));
        }
    };

    const saveItem = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        context.setSaving(true);
        context.setNotice('');
        const currentId = context.editingId;

        saveItemRequest(currentId, context.draft)
            .then((saved) => {
                context.setEditingId(null);
                context.setSaving(false);
                context.setNotice(
                    currentId === 'new'
                        ? 'Item created successfully.'
                        : 'Item updated successfully.',
                );
                context.setSelectedId(saved.id);
                context.setDetails(null);
                context.setDetailsState('loading');
                context.setDetailsReloadKey((key) => key + 1);
                context.setListState('loading');
                context.setReloadKey((key) => key + 1);
            })
            .catch((reason: Error) => {
                context.setSaving(false);
                context.setError(reason.message);
            });
    };

    const removeItem = (id: string) => {
        if (!window.confirm('Remove this item?')) return;

        context.setRemovingId(id);
        context.setNotice('');
        removeSelectedItem(id)
            .then(() => {
                if (context.selectedId === id) {
                    context.setSelectedId(null);
                    context.setDetails(null);
                    context.setDetailsState('idle');
                }
                context.setRemovingId(null);
                context.setNotice('Item removed successfully.');
                context.setListState('loading');
                context.setReloadKey((key) => key + 1);
            })
            .catch((reason: Error) => {
                context.setRemovingId(null);
                context.setError(reason.message);
            });
    };

    const completeItem = () => {
        if (!context.selectedId || context.completingId) return;

        const completionId = context.selectedId;
        context.setCompletingId(completionId);
        context.setNotice('');
        markItemAvailable(completionId)
            .then((updated) => {
                context.setCompletingId(null);
                context.setNotice(`"${updated.name}" is now available.`);
                context.setItems((current) =>
                    current.map((item) =>
                        item.id === completionId
                            ? { ...item, status: updated.status }
                            : item,
                    ),
                );
                if (context.selectedId === completionId) {
                    context.setDetails(updated);
                }
            })
            .catch((reason: Error) => {
                context.setCompletingId(null);
                context.setError(reason.message);
            });
    };

    return {
        refresh,
        selectItem,
        startCreate,
        startEdit,
        saveItem,
        removeItem,
        completeItem,
    };
}
