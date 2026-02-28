import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from '../features/auth/AuthPage.tsx'
import AppLayout from './AppLayout.tsx';
import { useAuth } from '../features/auth/AuthProvider.tsx';
import { useSessionLifecycle } from '../features/session/useSessionLifecycle.ts';
import SessionLoadingScreen from '../features/session/SessionLoadingScreen.tsx';

export default function App() {
    const { isLoggedIn, isLoading } = useAuth();
    const { bootstrapping } = useSessionLifecycle();

    if (isLoading || bootstrapping) return <SessionLoadingScreen />;

    return (
        <Router>
            <Routes>
                <Route path='/login' element={isLoggedIn ? <Navigate to='/app' /> : <AuthPage />} />
                <Route path='/app' element={isLoggedIn ? <AppLayout /> : <Navigate to='/login' />} />
                <Route path='*' element={<Navigate to='/login' />} />
            </Routes>
        </Router>
    )
}
