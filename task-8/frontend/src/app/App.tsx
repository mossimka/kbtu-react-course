import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { AuthProvider } from '../features/auth/auth-provider';
import { AppRoutes } from './routes';
import { store } from './store';

const baseUrl = import.meta.env.BASE_URL;
const basename = baseUrl === '/' ? undefined : baseUrl.replace(/\/$/, '');

export default function App() {
    return (
        <Provider store={store}>
            <BrowserRouter basename={basename}>
                <AuthProvider>
                    <AppRoutes />
                </AuthProvider>
            </BrowserRouter>
        </Provider>
    );
}
