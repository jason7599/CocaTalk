import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './components/AuthPage.tsx';
import MainLayout from './MainLayout.tsx';

function isLoggedIn(): boolean {
  const token = localStorage.getItem('token');
  return !!token;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path='/login' element={isLoggedIn() ? <Navigate to='/chatrooms'/> : <AuthPage />} />
        <Route path='/chatrooms' element={isLoggedIn() ? <MainLayout /> : <Navigate to='/login'/> } />
        <Route path='*' element={<Navigate to='/login' />} />
      </Routes>
    </Router>
  )
}
