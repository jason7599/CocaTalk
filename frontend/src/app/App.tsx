import { StompProvider } from '../services/ws/stompContext.tsx';
import AppInner from './AppInner.tsx';

export default function App() {
    return (
        <StompProvider>
            <AppInner />
        </StompProvider>
    );
}
