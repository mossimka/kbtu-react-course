import { apiRequest } from './service';

export type AuthUser = {
    id: number;
    name: string;
    email: string;
    role: string;
    createdAt: string;
};

export type AuthSession = {
    token: string;
    tokenType: string;
    expiresInSeconds: number;
    user: AuthUser;
};

export const loginRequest = (email: string, password: string) =>
    apiRequest<AuthSession>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });

export const registerRequest = (name: string, email: string, password: string) =>
    apiRequest<AuthSession>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
    });

export const meRequest = (signal?: AbortSignal) => apiRequest<AuthUser>('/api/auth/me', {}, signal);

export const logoutRequest = () => apiRequest<void>('/api/auth/logout', { method: 'POST' });
