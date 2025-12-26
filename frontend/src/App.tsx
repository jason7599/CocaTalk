import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './components/AuthPage.tsx';
import MainPage from './MainPage.tsx';

import { isLoggedIn } from './api/auth.ts';

export default function App() {

    return (
        <Router>
            <Routes>
                <Route path='/login' element={isLoggedIn() ? <Navigate to='/chatrooms' /> : <AuthPage />} />
                <Route path='/chatrooms' element={isLoggedIn() ? <MainPage /> : <Navigate to='/login' />} />
                <Route path='*' element={<Navigate to='/login' />} />
            </Routes>
        </Router>
    )
}
