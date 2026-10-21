import type { ListItem } from '../types';

type ResourceListProps = {
    items: ListItem[];
    selectedId: string | null;
    state: 'loading' | 'success' | 'error';
    onSelect: (id: string) => void;
    onAdd: () => void;
    onReload: () => void;
};

export function ResourceList({ items, selectedId, state, onSelect, onAdd, onReload }: ResourceListProps) {
    return (
        <aside className='list-panel' aria-label='Resource list'>
            <div className='panel-heading'>
                <div>
                    <h2>All resources</h2>
                    <span className='count'>{items.length} items</span>
                </div>
                <button className='button primary small' type='button' onClick={onAdd}>
                    ＋ Add
                </button>
            </div>
            {state === 'loading' && (
                <div className='state'>
                    <span className='spinner' /> Loading resources…
                </div>
            )}
            {state === 'error' && (
                <div className='state'>
                    <p>Could not load resources.</p>
                    <button className='button secondary small' type='button' onClick={onReload}>
                        Try again
                    </button>
                </div>
            )}
            {state === 'success' && items.length === 0 && (
                <div className='state'>
                    <p>Your inventory is empty.</p>
                    <button className='button primary small' type='button' onClick={onAdd}>
                        Add the first item
                    </button>
                </div>
            )}
            {state === 'success' && items.length > 0 && (
                <div className='item-list'>
                    {items.map((item) => (
                        <button
                            className={`item-row ${selectedId === item.id ? 'selected' : ''}`}
                            type='button'
                            key={item.id}
                            onClick={() => onSelect(item.id)}
                        >
                            <span className='item-icon'>{item.name.charAt(0).toUpperCase()}</span>
                            <span className='item-copy'>
                                <strong>{item.name}</strong>
                                <small>{item.category}</small>
                            </span>
                            <span
                                className={`status-dot ${item.status.toLowerCase().replace(' ', '-')}`}
                                aria-label={item.status}
                            />
                        </button>
                    ))}
                </div>
            )}
        </aside>
    );
}
