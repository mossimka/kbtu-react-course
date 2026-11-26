import { onAuthStateChanged, type User } from 'firebase/auth';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
    backendLoginRequest,
    backendLogoutRequest,
    backendRegisterRequest,
    ensureAuthPersistence,
    googleLoginRequest,
    loginRequest,
    logoutRequest,
    registerRequest,
    restoreBackendSession,
    type AuthUser,
} from '../../services/auth.service';
import { auth } from '../../services/firebase';
import { AuthContext, type AuthContextValue } from './auth-context';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        void ensureAuthPersistence();

        if (auth) {
            const unsubscribe = onAuthStateChanged(auth, (nextUser: User | null) => {
                setUser(nextUser);
                setLoading(false);
            });
            return unsubscribe;
        }

        // No Firebase configuration: restore the backend token session so the
        // deployed build still supports sign-in, protected routes and CRUD.
        const controller = new AbortController();
        void restoreBackendSession(controller.signal)
            .then((restoredUser) => {
                if (!controller.signal.aborted) setUser(restoredUser);
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        return () => controller.abort();
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        setUser(auth ? await loginRequest(email, password) : await backendLoginRequest(email, password));
    }, []);

    const register = useCallback(async (name: string, email: string, password: string) => {
        setUser(
            auth ? await registerRequest(name, email, password) : await backendRegisterRequest(name, email, password),
        );
    }, []);

    const googleLogin = useCallback(async () => {
        if (!auth) {
            throw new Error('Google sign-in is unavailable in this deployment. Use email and password instead.');
        }
        setUser(await googleLoginRequest());
    }, []);

    const logout = useCallback(async () => {
        if (auth) {
            await logoutRequest();
        } else {
            await backendLogoutRequest();
        }
        setUser(null);
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({ user, loading, initialized: !loading, login, register, googleLogin, logout }),
        [user, loading, login, register, googleLogin, logout],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
