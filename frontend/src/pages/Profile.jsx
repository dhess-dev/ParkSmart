import {useEffect, useState} from "react";
import {Container, CircularProgress} from "@mui/material";
import {useNavigate} from "react-router-dom";
import UserForm from "../components/UserForm";
import {userFieldsConfig} from "../config/userFields";

const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8443";

export default function Profile() {
    const [user, setUser] = useState(null);
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`${apiUrl}/api/users/me`, {credentials: "include"})
            .then((r) => {
                if (!r.ok) throw new Error("Not authorized");
                return r.json();
            })
            .then(setUser)
            .catch(() => navigate("/login", {replace: true}));
    }, [navigate]);

    if (!user) {
        return (
            <Container sx={{textAlign: "center", mt: 8}}>
                <CircularProgress/>
            </Container>
        );
    }

    const handleSave = async (values) => {
        setSaving(true);
        try {
            const res = await fetch(`${apiUrl}/api/users/me`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify(values),
            });
            if (!res.ok) throw new Error(await res.text());
            setUser(await res.json());
            alert("Profile saved!");
        } catch (err) {
            console.error(err);
            alert("Save failed: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{mt: 4, mb: 4}}>
            <UserForm
                initialValues={user}
                fieldsConfig={userFieldsConfig}
                onSubmit={handleSave}
                submitText="Änderungen speichern"
                loading={saving}
            />
        </Container>
    );
}
