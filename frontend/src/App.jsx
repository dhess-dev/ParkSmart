import {BrowserRouter, Routes, Route} from "react-router-dom";
import {useState, useEffect} from "react";

import Layout from "./Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

export default function App() {
    const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8443";
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch current user on startup
    useEffect(() => {
        fetch(`${apiUrl}/api/users/me`, {credentials: "include"})
            .then(res => {
                if (!res.ok) throw new Error("not logged in");
                return res.json();
            })
            .then(setUser)
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p>Loading…</p>;

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={
                        <Layout
                            user={user}
                            onLogout={() => {
                                // call your logout endpoint to clear the session cookie,
                                // then clear local user state:
                                fetch(`${apiUrl}/api/users/logout`, {
                                    method: "POST",
                                    credentials: "include",
                                }).finally(() => setUser(null));
                            }}
                        />
                    }
                >
                    {/* Public */}
                    <Route index element={<Home/>}/>
                    <Route path="about" element={<About/>}/>
                    <Route path="dashboard" element={<Dashboard/>}/>
                    <Route
                        path="login"
                        element={<Login onLogin={() => {
                            // after successful login, re-fetch /me:
                            fetch(`${apiUrl}/api/users/me`, {credentials: "include"})
                                .then(r => {
                                    if (!r.ok) throw new Error("Failed to fetch user data");
                                    return r.json();
                                })
                                .then(setUser)
                                .catch(() => setUser(null));
                        }}/>}
                    />

                    {/* Authenticated */}
                    <Route
                        path="profile"
                        element={
                            <ProtectedRoute user={user}>
                                <Profile/>
                            </ProtectedRoute>
                        }
                    />

                    {/* Admin only */}
                    <Route
                        path="admin"
                        element={
                            <AdminRoute user={user}>
                                <Admin/>
                            </AdminRoute>
                        }
                    />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
