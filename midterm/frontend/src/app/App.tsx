import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { DashboardPage } from '../pages/dashboard/dashboard-page';
import { MissionCreatePage } from '../pages/mission-create/mission-create-page';
import { MissionDetailsPage } from '../pages/mission-details/mission-details-page';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<DashboardPage />} />
                <Route path='/missions/new' element={<MissionCreatePage />} />
                <Route path='/missions/:id' element={<MissionDetailsPage />} />
            </Routes>
        </BrowserRouter>
    );
}
