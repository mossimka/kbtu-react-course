import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { ApiError } from '../../services/service';
import { useAuth } from './auth-context';
import styles from './auth-form.module.scss';

type AuthFormProps = {
    mode: 'login' | 'register';
};

const isSafeRedirect = (value: string | null): value is string =>
    Boolean(value && value.startsWith('/') && !value.startsWith('//'));

export const AuthForm = ({ mode }: AuthFormProps) => {
    const { user, login, register } = useAuth();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const redirectParam = searchParams.get('redirect');
    const redirect = isSafeRedirect(redirectParam) ? redirectParam : '/account';

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const isRegister = mode === 'register';

    if (user) {
        return <Navigate to={redirect} replace />;
    }

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        if (isRegister && password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setSubmitting(true);

        try {
            if (isRegister) {
                await register(name, email, password);
            } else {
                await login(email, password);
            }
        } catch (requestError: unknown) {
            setError(
                requestError instanceof ApiError
                    ? requestError.message
                    : 'Mission control could not reach the authentication service.',
            );
        } finally {
            setSubmitting(false);
        }
    };

    const switchLink = {
        pathname: isRegister ? '/login' : '/register',
        search: location.search,
    };

    return (
        <div className={styles.page}>
            <section className={styles.card}>
                <p className={styles.eyebrow}>
                    {isRegister ? 'CREW ENLISTMENT / NEW OPERATOR' : 'OPERATOR ACCESS / CLEARANCE REQUIRED'}
                </p>
                <h1>{isRegister ? 'Create account' : 'Sign in'}</h1>
                <p className={styles.lead}>
                    {isRegister
                        ? 'Create an operator profile to launch and manage missions. Your session is secured with a bearer token.'
                        : 'Sign in to launch missions, update flight records and manage the manifest.'}
                </p>

                <form className={styles.form} onSubmit={submit}>
                    {isRegister && (
                        <label>
                            Full name
                            <input
                                autoComplete='name'
                                minLength={2}
                                maxLength={80}
                                placeholder='Ada Lovelace'
                                required
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                            />
                        </label>
                    )}
                    <label>
                        Email
                        <input
                            autoComplete='email'
                            placeholder='operator@orbital.space'
                            required
                            type='email'
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                        />
                    </label>
                    <label>
                        Password
                        <input
                            autoComplete={isRegister ? 'new-password' : 'current-password'}
                            minLength={8}
                            maxLength={72}
                            placeholder='At least 8 characters'
                            required
                            type='password'
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                        />
                    </label>
                    {isRegister && (
                        <label>
                            Confirm password
                            <input
                                autoComplete='new-password'
                                minLength={8}
                                maxLength={72}
                                placeholder='Repeat your password'
                                required
                                type='password'
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                            />
                        </label>
                    )}

                    {error && (
                        <p className={styles.error} role='alert'>
                            {error}
                        </p>
                    )}

                    <button disabled={submitting} type='submit'>
                        {submitting ? 'CONNECTING...' : isRegister ? 'CREATE ACCOUNT' : 'LOG IN'}
                    </button>
                </form>

                <p className={styles.switch}>
                    {isRegister ? 'Already have an account?' : 'New to mission control?'}{' '}
                    <Link to={switchLink}>{isRegister ? 'Sign in' : 'Create an account'}</Link>
                </p>

                <p className={styles.links}>
                    <Link to='/'>← Back to home</Link>
                    <Link to='/missions'>View missions</Link>
                </p>
            </section>

            <aside className={styles.aside} aria-hidden='true'>
                <div className={styles.badge}>✦</div>
                <p>SECURE CHANNEL</p>
                <span>BEARER TOKEN // DEEP SPACE NETWORK</span>
            </aside>
        </div>
    );
};
