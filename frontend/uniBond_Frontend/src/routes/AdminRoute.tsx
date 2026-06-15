import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuthHook";
import { ROUTES } from "@/utils/constants";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to={ROUTES.LOGIN} replace />;
    }

    if (user.role !== "admin") {
        return <Navigate to={ROUTES.HOME} replace />;
    }

    return <>{children}</>;
}
