import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8443";

function Profile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`${apiUrl}/api/users/me`, {
            method: "GET",
            credentials: "include", // 👈 required for session-based login
        })
            .then(res => {
                if (res.status === 401 || res.status === 403) {
                    throw new Error("Unauthorized");
                }
                return res.json();
            })
            .then(data => {
                setUser(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Not authorized or failed to fetch profile", err);
                navigate("/login", { replace: true, state: { from: "/profile" } });
            });
    }, [navigate]);

    if (loading) return <p>Loading profile...</p>;

    return (
        <div>
            <h2>My Profile</h2>
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
        </div>
    );
}

export default Profile;
