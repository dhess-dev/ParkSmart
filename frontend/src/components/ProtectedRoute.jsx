// src/components/ProtectedRoute.jsx
import {Navigate, useLocation} from "react-router-dom";

function ProtectedRoute({isLoggedIn, children}) {
    const location = useLocation();

    if (!isLoggedIn) {
        return <Navigate to="/login" replace state={{from: location}}/>;
    }

    return children;
}

export default ProtectedRoute;
