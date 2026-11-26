import { useState, type SyntheticEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { saveMission, selectMissionMutation } from '../../features/missions/model/missions-slice';
import type { MissionInput, MissionPriority } from '../../entities/mission/model/types';
import { ErrorState } from '../../shared/ui/request-state/request-state';

const initialForm: MissionInput = {
    name: '',
    destination: '',
    type: 'Exploration',
    status: 'active',
    priority: 'medium',
    crew: 4,
    description: '',
    launchDate: '',
};

export function MissionCreatePage() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [form, setForm] = useState<MissionInput>(initialForm);
    const { status, error } = useAppSelector(selectMissionMutation);
    const saving = status === 'pending';

    const update = <K extends keyof MissionInput>(key: K, value: MissionInput[K]) => {
        setForm((current) => ({ ...current, [key]: value }));
    };

    const submitMission = async () => {
        const result = await dispatch(saveMission({ type: 'create', input: form }));
        if (saveMission.fulfilled.match(result)) navigate('/missions');
    };

    const submit = async (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        await submitMission();
    };

    return (
        <section className='dashboard-content form-page'>
            <Link to='/missions' className='back-link'>
                ← BACK TO MANIFEST
            </Link>
            <p className='eyebrow'>MISSION CONTROL / NEW FLIGHT PLAN</p>
            <h1>Launch mission</h1>
            {error && <ErrorState message={error} onRetry={() => void submitMission()} />}
            <form className='mission-form' onSubmit={submit}>
                <label>
                    Mission name
                    <input
                        required
                        minLength={3}
                        value={form.name}
                        onChange={(event) => update('name', event.target.value)}
                    />
                </label>
                <label>
                    Destination
                    <input
                        required
                        value={form.destination}
                        onChange={(event) => update('destination', event.target.value)}
                    />
                </label>
                <label>
                    Mission type
                    <input required value={form.type} onChange={(event) => update('type', event.target.value)} />
                </label>
                <label>
                    Launch date
                    <input
                        required
                        type='date'
                        value={form.launchDate}
                        onChange={(event) => update('launchDate', event.target.value)}
                    />
                </label>
                <label>
                    Priority
                    <select
                        value={form.priority}
                        onChange={(event) => update('priority', event.target.value as MissionPriority)}
                    >
                        <option value='critical'>Critical</option>
                        <option value='high'>High</option>
                        <option value='medium'>Medium</option>
                        <option value='low'>Low</option>
                    </select>
                </label>
                <label>
                    Crew size
                    <input
                        required
                        type='number'
                        min='1'
                        max='20'
                        value={form.crew}
                        onChange={(event) => update('crew', Number(event.target.value))}
                    />
                </label>
                <label className='wide'>
                    Description
                    <textarea
                        rows={5}
                        value={form.description}
                        onChange={(event) => update('description', event.target.value)}
                    />
                </label>
                <button disabled={saving} type='submit'>
                    {saving ? 'LAUNCHING...' : 'CONFIRM LAUNCH'}
                </button>
            </form>
        </section>
    );
}
