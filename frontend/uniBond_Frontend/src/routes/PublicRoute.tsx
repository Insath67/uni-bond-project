import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuthHook';

type Props = {
    children: React.ReactNode;
};

export default function PublicRoute({ children }: Props) {
    const { user } = useAuth();

    if (user) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}