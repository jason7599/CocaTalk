import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './components/AuthPage.tsx';
import MainPage from './MainPage.tsx';

import { useUserStore } from './store/userStore.tsx';
import { useEffect } from 'react';

export default function App() {

    const user = useUserStore((s) => s.user);
    const refreshUser = useUserStore((s) => s.refreshUser);
    const isLoggedIn = !!user;

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    return (
        <Router>
            <Routes>
                <Route path='/login' element={isLoggedIn ? <Navigate to='/app' /> : <AuthPage />} />
                <Route path='/app' element={isLoggedIn ? <MainPage /> : <Navigate to='/login' />} />
                <Route path='*' element={<Navigate to='/login' />} />
            </Routes>
        </Router>
    )
}
