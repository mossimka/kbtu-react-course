import type { FormEvent } from 'react';
import type { ItemDraft, Priority, Status } from '../types';

type ItemFormProps = {
    isNew: boolean;
    draft: ItemDraft;
    saving: boolean;
    onChange: (draft: ItemDraft) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onCancel: () => void;
};

export function ItemForm({ isNew, draft, saving, onChange, onSubmit, onCancel }: ItemFormProps) {
    const update = <K extends keyof ItemDraft>(key: K, value: ItemDraft[K]) => onChange({ ...draft, [key]: value });
    return (
        <form className='edit-form' onSubmit={onSubmit}>
            <div className='detail-topline'>
                <span className='badge'>{isNew ? 'New resource' : 'Edit resource'}</span>
            </div>
            <h2>{isNew ? 'Add a resource' : 'Update resource'}</h2>
            <div className='form-grid'>
                <label>
                    Name
                    <input required value={draft.name} onChange={(event) => update('name', event.target.value)} />
                </label>
                <label>
                    Category
                    <input
                        required
                        value={draft.category}
                        onChange={(event) => update('category', event.target.value)}
                    />
                </label>
                <label>
                    Owner
                    <input required value={draft.owner} onChange={(event) => update('owner', event.target.value)} />
                </label>
                <label>
                    Location
                    <input
                        required
                        value={draft.location}
                        onChange={(event) => update('location', event.target.value)}
                    />
                </label>
                <label>
                    Status
                    <select value={draft.status} onChange={(event) => update('status', event.target.value as Status)}>
                        <option>Available</option>
                        <option>In use</option>
                        <option>Maintenance</option>
                    </select>
                </label>
                <label>
                    Priority
                    <select
                        value={draft.priority}
                        onChange={(event) => update('priority', event.target.value as Priority)}
                    >
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                    </select>
                </label>
                <label className='wide'>
                    Description
                    <textarea
                        required
                        rows={4}
                        value={draft.description}
                        onChange={(event) => update('description', event.target.value)}
                    />
                </label>
            </div>
            <div className='detail-actions'>
                <button className='button primary' type='submit' disabled={saving}>
                    {saving ? 'Saving…' : 'Save resource'}
                </button>
                <button className='button secondary' type='button' onClick={onCancel} disabled={saving}>
                    Cancel
                </button>
            </div>
        </form>
    );
}
