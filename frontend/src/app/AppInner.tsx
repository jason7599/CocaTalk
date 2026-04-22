import type React from "react";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import SessionLoadingScreen from "../features/session/SessionLoadingScreen";
import { useAuthStore } from "../features/auth/authStore";
import { useSessionLifecycle } from "../features/session/useSessionLifecycle";
import AppLayout from "./AppLayout";
import AuthPage from "../features/auth/AuthPage";
import { useStomp } from "../services/ws/stompContext";

const AppInner: React.FC = () => {
    const { connected } = useStomp();
    const { bootstrapping } = useSessionLifecycle();

    const user = useAuthStore((s) => s.user);
    const loadingUser = useAuthStore((s) => s.isLoading);
    const isLoggedIn = !!user;

    if (loadingUser || bootstrapping) return <SessionLoadingScreen />;
    if (isLoggedIn && !connected) return <SessionLoadingScreen />;

    return (
        <Router>
            <Routes>
                <Route path='/login' element={isLoggedIn ? <Navigate to='/app' /> : <AuthPage />} />
                <Route path='/app' element={isLoggedIn ? <AppLayout /> : <Navigate to='/login' />} />
                <Route path='*' element={<Navigate to='/login' />} />
            </Routes>
        </Router>
    );
};

export default AppInner;