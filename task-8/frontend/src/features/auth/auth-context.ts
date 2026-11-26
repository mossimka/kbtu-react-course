import { createContext, useContext } from 'react';
import type { AuthUser } from '../../services/auth.service';

export type AuthContextValue = {
    user: AuthUser | null;
    loading: boolean;
    initialized: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    googleLogin: () => Promise<void>;
    logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = (): AuthContextValue => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
};
