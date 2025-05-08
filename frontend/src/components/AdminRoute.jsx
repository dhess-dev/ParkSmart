import { Navigate, useLocation } from "react-router-dom";

export default function AdminRoute({ user, children }) {
    const location = useLocation();
    if (!user?.roles?.includes("ADMIN")) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }
    return children;
}
