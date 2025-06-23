import React, {useState} from "react";
import {TextField, Button, Typography, Box} from "@mui/material";
import {useNavigate} from "react-router-dom";

export default function Login({onLogin}) {
    const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8443";

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async e => {
        e.preventDefault();
        setError("");

        const res = await fetch(`${apiUrl}/api/users/login`, {
            method: "POST",
            headers: {"Content-Type": "application/x-www-form-urlencoded"},
            body: new URLSearchParams({username, password}),
            credentials: "include",
        });

        if (res.ok) {
            await onLogin();
            navigate("/");
        } else {
            try {
                const errorData = await res.json();
                setError(errorData.error || "Login failed");
            } catch {
                setError("Login failed");
            }
        }
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{maxWidth: 400, mx: "auto", mt: 5, display: "flex", flexDirection: "column", gap: 2}}
        >
            <Typography variant="h4" align="center">Login</Typography>
            <TextField
                label="Username" value={username}
                onChange={e => setUsername(e.target.value)} required
            />
            <TextField
                label="Passwort" type="password" value={password}
                onChange={e => setPassword(e.target.value)} required
            />
            <Button type="submit" variant="contained">Login</Button>
            {error && <Typography color="error">{error}</Typography>}
        </Box>
    );
}
