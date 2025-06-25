import {useState} from "react";
import {useNavigate} from "react-router-dom";
import UserForm from "../components/UserForm";
import {Box, Container, Typography} from "@mui/material";
import { Snackbar, Alert } from "@mui/material";

const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8443";

export default function Register() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);


    const initialValues = {
        username: "", email: "", password: "", confirm: "",
        firstName: "", lastName: "", phoneNumber: "",
        address: "", city: "", postalCode: "", country: "",
    };

    const fieldsConfig = [
        {name: "username", label: "Username", xs: 12, required: true},
        {name: "email", label: "Email", xs: 12, required: true},
        {name: "password", label: "Passwort", xs: 12, required: true, type: "password"},
        {name: "confirm", label: "Passwort bestätigen", xs: 12, required: true, type: "password"},
        {name: "firstName", label: "Vorname", xs: 6, required: true},
        {name: "lastName", label: "Nachname", xs: 6, required: true},
        {name: "phoneNumber", label: "TelefonNr", xs: 6, required: true},
        {name: "address", label: "Adresse", xs: 6, required: true},
        {name: "city", label: "Stadt", xs: 4, required: true},
        {name: "postalCode", label: "Plz", xs: 4, required: true},
        {name: "country", label: "Land", xs: 4, required: true},
    ];

    const handleSubmit = async (values) => {
        if (values.password !== values.confirm) {
            return alert("Passwörter stimmen nicht überein");
        }

        const { confirm: _, ...payload } = values;

        setLoading(true);
        try {
            const res = await fetch(`${apiUrl}/api/users`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error(await res.text());

            setSnackbarOpen(true); // 👈 show success notification

            setTimeout(() => {
                navigate("/login"); // 👈 wait a bit before navigating
            }, 1500);
        } catch (err) {
            alert("Registrierung fehlgeschlagen: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: 3,
            }}
        >
            <Box
                sx={{
                    maxWidth: {
                        xs: "100%",
                        sm: "80%",
                        md: "70%",
                    },
                }}
            >
                <UserForm
                    initialValues={initialValues}
                    fieldsConfig={fieldsConfig}
                    onSubmit={handleSubmit}
                    submitText="Registrieren"
                    loading={loading}
                />
            </Box>

            {/* success snackbar */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    severity="success"
                    variant="filled"
                    onClose={() => setSnackbarOpen(false)}
                    sx={{ width: "100%" }}
                >
                    Registrierung erfolgreich!
                </Alert>
            </Snackbar>
        </Box>
    );
}
