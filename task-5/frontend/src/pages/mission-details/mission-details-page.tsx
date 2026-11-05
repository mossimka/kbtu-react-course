import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Mission, MissionInput, MissionPriority, MissionStatus } from '../../entities/mission/model/types';
import { useAuth } from '../../features/auth/auth-context';
import { ApiError, getMission, updateMission } from '../../services/service';
import { ErrorState, LoadingState, SuccessState } from '../../shared/ui/request-state/request-state';

const toMissionInput = (mission: Mission): MissionInput => ({
    name: mission.name,
    destination: mission.destination,
    type: mission.type,
    status: mission.status,
    priority: mission.priority,
    crew: mission.crew,
    description: mission.description ?? '',
    launchDate: mission.launchDate ?? '',
});

const formatDate = (value?: string) => (value ? value.replace('T', ' ').slice(0, 16) : '—');

export function MissionDetailsPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const numericId = id && /^\d+$/.test(id) ? Number(id) : null;

    const [mission, setMission] = useState<Mission | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notFound, setNotFound] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState<MissionInput | null>(null);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);

    useEffect(() => {
        if (numericId === null) return;

        const controller = new AbortController();

        const load = async () => {
            setMission(null);
            setForm(null);
            setEditing(false);
            setNotFound(false);
            setError(null);
            setLoading(true);

            try {
                const loadedMission = await getMission(numericId, controller.signal);
                setMission(loadedMission);
                setForm(toMissionInput(loadedMission));
            } catch (requestError: unknown) {
                if (requestError instanceof DOMException && requestError.name === 'AbortError') return;
                if (requestError instanceof ApiError && requestError.status === 404) {
                    setNotFound(true);
                    return;
                }
                setError('Mission details could not be loaded.');
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };

        void load();

        return () => controller.abort();
    }, [numericId, reloadKey]);

    const update = <K extends keyof MissionInput>(key: K, value: MissionInput[K]) => {
        setForm((current) => (current ? { ...current, [key]: value } : current));
    };

    const cancelEditing = () => {
        if (mission) setForm(toMissionInput(mission));
        setSaveError(null);
        setEditing(false);
    };

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!mission || !form) return;

        setSaving(true);
        setSaveError(null);
        setSaveMessage(null);
        try {
            const updatedMission = await updateMission(mission.id, form);
            setMission(updatedMission);
            setForm(toMissionInput(updatedMission));
            setEditing(false);
            setSaveMessage('Mission details updated successfully.');
        } catch {
            setSaveError('Mission update failed. Check the fields and try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading && numericId !== null)
        return (
            <section className='dashboard-content'>
                <LoadingState />
            </section>
        );

    if (numericId === null || notFound)
        return (
            <section className='dashboard-content detail-page'>
                <button className='back-button' type='button' onClick={() => navigate(-1)}>
                    ← BACK
                </button>
                <div className='mission-missing'>
                    <p className='eyebrow'>MISSION RECORD / NOT FOUND</p>
                    <h1>Mission not found</h1>
                    <p>
                        No mission exists for ID <code>{id ?? 'unknown'}</code>. It may have been deleted, or the link
                        may be invalid.
                    </p>
                    <div className='mission-missing-actions'>
                        <Link to='/missions'>← RETURN TO MANIFEST</Link>
                        <Link to='/'>GO TO HOME</Link>
                    </div>
                </div>
            </section>
        );

    if (error || !mission || mission.id !== numericId)
        return (
            <section className='dashboard-content detail-page'>
                <button className='back-button' type='button' onClick={() => navigate(-1)}>
                    ← BACK
                </button>
                <ErrorState
                    message={error ?? 'Mission details are unavailable.'}
                    onRetry={() => setReloadKey((key) => key + 1)}
                />
            </section>
        );

    return (
        <section className='dashboard-content detail-page'>
            <div className='detail-toolbar'>
                <button className='back-button' type='button' onClick={() => navigate(-1)}>
                    ← BACK
                </button>
                <Link className='manifest-link' to='/missions'>
                    ALL MISSIONS
                </Link>
            </div>

            <p className='eyebrow'>MISSION RECORD / #{mission.id}</p>
            {saveMessage && <SuccessState message={saveMessage} />}
            {saveError && <ErrorState message={saveError} onRetry={() => setSaveError(null)} />}

            {editing && form ? (
                <form className='mission-form detail-form' onSubmit={submit}>
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
                        Status
                        <select
                            value={form.status}
                            onChange={(event) => update('status', event.target.value as MissionStatus)}
                        >
                            <option value='active'>Active</option>
                            <option value='completed'>Completed</option>
                        </select>
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
                    <div className='form-actions'>
                        <button disabled={saving} type='submit'>
                            {saving ? 'SAVING...' : 'SAVE CHANGES'}
                        </button>
                        <button className='secondary-action' disabled={saving} type='button' onClick={cancelEditing}>
                            CANCEL
                        </button>
                    </div>
                </form>
            ) : (
                <>
                    <div className='detail-heading'>
                        <h1>{mission.name}</h1>
                        {user ? (
                            <button
                                type='button'
                                onClick={() => {
                                    setSaveMessage(null);
                                    setEditing(true);
                                }}
                            >
                                EDIT MISSION
                            </button>
                        ) : (
                            <Link
                                className='manifest-link'
                                to={`/login?redirect=${encodeURIComponent(`/missions/${mission.id}`)}`}
                            >
                                SIGN IN TO EDIT
                            </Link>
                        )}
                    </div>
                    <div className='detail-grid'>
                        <div>
                            <span>DESTINATION</span>
                            <strong>{mission.destination}</strong>
                        </div>
                        <div>
                            <span>MISSION TYPE</span>
                            <strong>{mission.type.replaceAll('_', ' ')}</strong>
                        </div>
                        <div>
                            <span>STATUS</span>
                            <strong>{mission.status}</strong>
                        </div>
                        <div>
                            <span>PRIORITY</span>
                            <strong>{mission.priority}</strong>
                        </div>
                        <div>
                            <span>CREW SIZE</span>
                            <strong>{mission.crew}</strong>
                        </div>
                        <div>
                            <span>LAUNCH DATE</span>
                            <strong>{formatDate(mission.launchDate)}</strong>
                        </div>
                        <div>
                            <span>CREATED</span>
                            <strong>{formatDate(mission.createdAt)}</strong>
                        </div>
                        <div>
                            <span>RECORD ID</span>
                            <strong>#{mission.id}</strong>
                        </div>
                    </div>
                    <p className='description'>{mission.description || 'No mission briefing was provided.'}</p>
                </>
            )}
        </section>
    );
}
