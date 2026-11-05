import { useEffect, useState } from 'react';
import { getItem, listItems } from './api';
import { createAppHandlers } from './app-handlers';
import { ItemDetails } from './components/item-details.component';
import { ItemForm } from './components/item-form.component';
import { ResourceList } from './components/resource-list.component';
import type { Item, ItemDraft, ListItem } from './types';
import { emptyDraft } from './types';
import './app.css';

function App() {
    const [items, setItems] = useState<ListItem[]>([]);

    const [selectedId, setSelectedId] = useState<string | null>(null);

    const [details, setDetails] = useState<Item | null>(null);

    const [listState, setListState] = useState<'loading' | 'success' | 'error'>('loading');
    const [detailsState, setDetailsState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const [error, setError] = useState('');
    const [detailsError, setDetailsError] = useState('');

    const [reloadKey, setReloadKey] = useState(0);
    const [detailsReloadKey, setDetailsReloadKey] = useState(0);

    const [editingId, setEditingId] = useState<string | null>(null);

    const [draft, setDraft] = useState<ItemDraft>(emptyDraft);

    const [saving, setSaving] = useState(false);

    const [removingId, setRemovingId] = useState<string | null>(null);

    const [completingId, setCompletingId] = useState<string | null>(null);

    const [notice, setNotice] = useState('');

    useEffect(() => {
        let cancelled = false;
        listItems()
            .then((result) => {
                if (!cancelled) {
                    setItems(result);
                    setListState('success');
                }
            })
            .catch((reason: Error) => {
                if (!cancelled) {
                    setError(reason.message);
                    setListState('error');
                }
            });
        return () => {
            cancelled = true;
        };
    }, [reloadKey]);

    useEffect(() => {
        if (!selectedId) return;
        let cancelled = false;
        const requestedId = selectedId;
        getItem(requestedId)
            .then((result) => {
                if (!cancelled && selectedId === requestedId) {
                    setDetails(result);
                    setDetailsState('success');
                }
            })
            .catch((reason: Error) => {
                if (!cancelled && selectedId === requestedId) {
                    setDetailsError(reason.message);
                    setDetailsState('error');
                }
            });
        return () => {
            cancelled = true;
        };
    }, [selectedId, detailsReloadKey]);

    const {
        refresh,
        selectItem,
        startCreate,
        startEdit,
        saveItem,
        removeItem,
        completeItem,
    } = createAppHandlers({
        selectedId,
        details,
        editingId,
        draft,
        completingId,
        setNotice,
        setError,
        setListState,
        setDetails,
        setDetailsError,
        setDetailsState,
        setSelectedId,
        setDetailsReloadKey,
        setEditingId,
        setDraft,
        setSaving,
        setRemovingId,
        setCompletingId,
        setItems,
        setReloadKey,
    });

    return (
        <main className='app-shell'>
            <header className='app-header'>
                <div>
                    <p className='eyebrow'>ASYNC INVENTORY</p>
                    <h1>Workspace resources</h1>
                    <p className='subtitle'>A resilient item manager powered by simulated network requests.</p>
                </div>
                <button className='button secondary' type='button' onClick={refresh} disabled={listState === 'loading'}>
                    <span aria-hidden='true'>↻</span> Reload list
                </button>
            </header>
            {notice && (
                <div className='notice success' role='status'>
                    {notice}
                </div>
            )}
            {error && (
                <div className='notice error' role='alert'>
                    {error}
                    <button type='button' onClick={() => setError('')}>
                        Dismiss
                    </button>
                </div>
            )}
            <section className='workspace'>
                <ResourceList
                    items={items}
                    selectedId={selectedId}
                    state={listState}
                    onSelect={selectItem}
                    onAdd={startCreate}
                    onReload={refresh}
                />
                <section className='details-panel' aria-live='polite'>
                    {editingId ? (
                        <ItemForm
                            isNew={editingId === 'new'}
                            draft={draft}
                            saving={saving}
                            onChange={setDraft}
                            onSubmit={saveItem}
                            onCancel={() => setEditingId(null)}
                        />
                    ) : (
                        <ItemDetails
                            details={details}
                            state={detailsState}
                            error={detailsError}
                            completing={Boolean(completingId)}
                            removing={Boolean(removingId)}
                            onComplete={completeItem}
                            onEdit={startEdit}
                            onRemove={() => details && removeItem(details.id)}
                            onRetry={() => {
                                setDetailsState('loading');
                                setDetailsReloadKey((key) => key + 1);
                            }}
                        />
                    )}
                </section>
            </section>
            <footer>
                <span>Requests are delayed and may fail randomly to demonstrate real async states.</span>
                <span>Data persists in your browser.</span>
            </footer>
        </main>
    );
}

export default App;
