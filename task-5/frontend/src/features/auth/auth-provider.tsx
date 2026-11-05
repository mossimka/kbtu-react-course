import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { loginRequest, logoutRequest, meRequest, registerRequest, type AuthUser } from '../../services/auth.service';
import { clearToken, getToken, setToken } from '../../services/token';
import { AuthContext, type AuthContextValue } from './auth-context';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        const controller = new AbortController();

        const restoreSession = async () => {
            const token = getToken();

            if (!token) {
                setInitialized(true);
                return;
            }

            try {
                const currentUser = await meRequest(controller.signal);
                setUser(currentUser);
            } catch {
                clearToken();
                setUser(null);
            } finally {
                if (!controller.signal.aborted) setInitialized(true);
            }
        };

        void restoreSession();

        return () => controller.abort();
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const session = await loginRequest(email, password);
        setToken(session.token);
        setUser(session.user);
    }, []);

    const register = useCallback(async (name: string, email: string, password: string) => {
        const session = await registerRequest(name, email, password);
        setToken(session.token);
        setUser(session.user);
    }, []);

    const logout = useCallback(async () => {
        try {
            if (getToken()) await logoutRequest();
        } catch {
            // The local session is cleared even if the API call fails.
        }

        clearToken();
        setUser(null);
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({ user, initialized, login, register, logout }),
        [user, initialized, login, register, logout],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
