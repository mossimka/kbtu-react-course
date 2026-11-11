import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { PageLoader } from '../../shared/ui/page-loader/page-loader';
import { useAuth } from './auth-context';

export const ProtectedRoute = () => {
    const { user, initialized } = useAuth();
    const location = useLocation();

    if (!initialized) {
        return <PageLoader />;
    }

    if (!user) {
        const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
        return <Navigate to={`/login?redirect=${redirect}`} replace />;
    }

    return <Outlet />;
};
