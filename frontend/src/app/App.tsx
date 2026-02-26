import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from '../features/auth/AuthPage.tsx'
import AppLayout from './AppLayout.tsx';
import { useAuth } from '../features/auth/AuthProvider.tsx';

export default function App() {

    const { isLoggedIn, isLoading } = useAuth();

    if (isLoading) return <div>Loading...</div>

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
