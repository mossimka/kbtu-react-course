import { onAuthStateChanged, type User } from 'firebase/auth';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
    ensureAuthPersistence,
    googleLoginRequest,
    loginRequest,
    logoutRequest,
    registerRequest,
    type AuthUser,
} from '../../services/auth.service';
import { auth } from '../../services/firebase';
import { AuthContext, type AuthContextValue } from './auth-context';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        void ensureAuthPersistence();
        return onAuthStateChanged(auth, (nextUser: User | null) => {
            setUser(nextUser);
            setLoading(false);
        });
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        setUser(await loginRequest(email, password));
    }, []);

    const register = useCallback(async (name: string, email: string, password: string) => {
        setUser(await registerRequest(name, email, password));
    }, []);

    const googleLogin = useCallback(async () => {
        setUser(await googleLoginRequest());
    }, []);

    const logout = useCallback(async () => {
        await logoutRequest();
        setUser(null);
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({ user, loading, initialized: !loading, login, register, googleLogin, logout }),
        [user, loading, login, register, googleLogin, logout],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
