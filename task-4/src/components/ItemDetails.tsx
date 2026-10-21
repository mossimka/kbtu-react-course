import type { Item } from '../types';

type ItemDetailsProps = {
    details: Item | null;
    state: 'idle' | 'loading' | 'success' | 'error';
    error: string;
    completing: boolean;
    removing: boolean;
    onComplete: () => void;
    onEdit: () => void;
    onRemove: () => void;
    onRetry: () => void;
};

export function ItemDetails({
    details,
    state,
    error,
    completing,
    removing,
    onComplete,
    onEdit,
    onRemove,
    onRetry,
}: ItemDetailsProps) {
    if (state === 'idle')
        return (
            <div className='empty-detail'>
                <span className='empty-icon'>◈</span>
                <h2>Select a resource</h2>
                <p>Choose an item to asynchronously load its full details.</p>
            </div>
        );
    if (state === 'loading')
        return (
            <div className='state'>
                <span className='spinner' /> Fetching item details…
            </div>
        );
    if (state === 'error')
        return (
            <div className='state'>
                <p>{error}</p>
                <button className='button secondary small' type='button' onClick={onRetry}>
                    Try again
                </button>
            </div>
        );
    if (!details) return null;

    return (
        <div className='detail-content'>
            <div className='detail-topline'>
                <span className='badge'>{details.category}</span>
                <span className={`status-label ${details.status.toLowerCase().replace(' ', '-')}`}>
                    {details.status}
                </span>
            </div>
            <div className='detail-title'>
                <div>
                    <h2>{details.name}</h2>
                    <p>{details.description}</p>
                </div>
                <span className='large-icon'>{details.name.charAt(0).toUpperCase()}</span>
            </div>
            <div className='detail-actions'>
                <button
                    className='button primary'
                    type='button'
                    onClick={onComplete}
                    disabled={completing || details.status === 'Available'}
                >
                    {completing ? 'Updating…' : details.status === 'Available' ? 'Already available' : 'Mark available'}
                </button>
                <button className='button secondary' type='button' onClick={onEdit} disabled={completing}>
                    Edit details
                </button>
                <button className='button danger' type='button' onClick={onRemove} disabled={removing}>
                    {removing ? 'Removing…' : 'Remove'}
                </button>
            </div>
            <div className='field-grid'>
                <div>
                    <span>Owner</span>
                    <strong>{details.owner}</strong>
                </div>
                <div>
                    <span>Priority</span>
                    <strong>{details.priority}</strong>
                </div>
                <div>
                    <span>Location</span>
                    <strong>{details.location}</strong>
                </div>
                <div>
                    <span>Last updated</span>
                    <strong>{details.lastUpdated}</strong>
                </div>
            </div>
            <div className='tags'>
                <span>Tags</span>
                {details.tags.map((tag) => (
                    <b key={tag}>{tag}</b>
                ))}
            </div>
        </div>
    );
}
