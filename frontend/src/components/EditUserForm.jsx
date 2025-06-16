import {useEffect, useState} from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack
} from "@mui/material";

export default function EditUserForm({user, open, onClose, onSaved, apiUrl}) {
    const [values, setValues] = useState(user);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setValues(user);
    }, [user]);

    const handleChange = (field) => (e) => setValues((v) => ({...v, [field]: e.target.value}));

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`${apiUrl}/api/users/${user.id}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify(values),
            });
            const updated = await res.json();
            onSaved(updated);
        } catch (e) {
            console.error(e);
            alert("Speichern fehlgeschlagen");
        } finally {
            setSaving(false);
        }
    };

    return (<Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>User bearbeiten</DialogTitle>
        <DialogContent>
            <Stack spacing={2} mt={1}>
                <TextField
                    label="Username"
                    value={values.username || ""}
                    onChange={handleChange("username")}
                    fullWidth
                />
                <TextField
                    label="E-Mail"
                    value={values.email || ""}
                    onChange={handleChange("email")}
                    fullWidth
                />
                <TextField
                    label="firstName"
                    value={values.firstName || ""}
                    onChange={handleChange("firstName")}
                    fullWidth
                />
                <TextField
                    label="lastName"
                    value={values.lastName || ""}
                    onChange={handleChange("lastName")}
                    fullWidth
                />
                <TextField
                    label="phoneNumber"
                    value={values.phoneNumber || ""}
                    onChange={handleChange("phoneNumber")}
                    fullWidth
                />
                <TextField
                    label="address"
                    value={values.address || ""}
                    onChange={handleChange("address")}
                    fullWidth
                />
                <TextField
                    label="city"
                    value={values.city || ""}
                    onChange={handleChange("city")}
                    fullWidth
                />
                <TextField
                    label="country"
                    value={values.country || ""}
                    onChange={handleChange("country")}
                    fullWidth
                />
                <TextField
                    label="postalCode"
                    value={values.postalCode || ""}
                    onChange={handleChange("postalCode")}
                    fullWidth
                />
                {/* … weitere Felder analog … */}
            </Stack>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose} disabled={saving}>
                Abbrechen
            </Button>
            <Button onClick={handleSave} disabled={saving} variant="contained">
                {saving ? "Speichern…" : "Speichern"}
            </Button>
        </DialogActions>
    </Dialog>);
}
