import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../features/auth/protected-route';
import { RootLayout } from '../widgets/layout/root-layout';

const HomePage = lazy(() => import('../pages/home/home-page').then((module) => ({ default: module.HomePage })));
const AboutPage = lazy(() => import('../pages/about/about-page').then((module) => ({ default: module.AboutPage })));
const MissionsPage = lazy(() =>
    import('../pages/missions/missions-page').then((module) => ({ default: module.MissionsPage })),
);
const MissionDetailsPage = lazy(() =>
    import('../pages/mission-details/mission-details-page').then((module) => ({ default: module.MissionDetailsPage })),
);
const MissionCreatePage = lazy(() =>
    import('../pages/mission-create/mission-create-page').then((module) => ({ default: module.MissionCreatePage })),
);
const DashboardPage = lazy(() =>
    import('../pages/dashboard/dashboard-page').then((module) => ({ default: module.DashboardPage })),
);
const LoginPage = lazy(() => import('../pages/login/login-page').then((module) => ({ default: module.LoginPage })));
const RegisterPage = lazy(() =>
    import('../pages/register/register-page').then((module) => ({ default: module.RegisterPage })),
);
const AccountPage = lazy(() =>
    import('../pages/account/account-page').then((module) => ({ default: module.AccountPage })),
);
const NotFoundPage = lazy(() =>
    import('../pages/not-found/not-found-page').then((module) => ({ default: module.NotFoundPage })),
);

export const AppRoutes = () => (
    <Routes>
        <Route element={<RootLayout />}>
            <Route index element={<HomePage />} />
            <Route path='about' element={<AboutPage />} />
            <Route path='missions' element={<MissionsPage />} />
            <Route path='missions/:id' element={<MissionDetailsPage />} />
            <Route path='dashboard' element={<DashboardPage />} />
            <Route path='login' element={<LoginPage />} />
            <Route path='signup' element={<RegisterPage />} />
            <Route path='register' element={<RegisterPage />} />
            <Route element={<ProtectedRoute />}>
                <Route path='account' element={<AccountPage />} />
                <Route path='profile' element={<AccountPage />} />
                <Route path='missions/new' element={<MissionCreatePage />} />
            </Route>
            <Route path='*' element={<NotFoundPage />} />
        </Route>
    </Routes>
);
