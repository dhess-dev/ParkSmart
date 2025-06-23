import {useState} from "react";
import {useNavigate} from "react-router-dom";
import UserForm from "../components/UserForm";

const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8443";

export default function Register() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const initialValues = {
        username: "",
        email: "",
        password: "",
        confirm: "",
        firstName: "",
        lastName: "",
        phoneNumber: "",
        address: "",
        city: "",
        postalCode: "",
        country: "",
    };

    const fieldsConfig = [
        {name: "username", label: "Username", xs: 12, required: true},
        {name: "email", label: "Email", xs: 12, required: true},
        {name: "password", label: "Passwort", xs: 12, required: true, type: "password"},
        {name: "confirm", label: "Passwort bestätigen", xs: 12, required: true, type: "password"},

        {name: "firstName", label: "Vorname", required: true, xs: 6},
        {name: "lastName", label: "Nachname", required: true, xs: 6},
        {name: "phoneNumber", label: "Telefonnummer", required: true, xs: 6},
        {name: "address", label: "Adresse", required: true, xs: 6},
        {name: "city", label: "Stadt", required: true, xs: 4},
        {name: "postalCode", label: "Postleitzahl", required: true, xs: 4},
        {name: "country", label: "Land", required: true, xs: 4},
    ];

    const handleSubmit = async (values) => {
        if (values.password !== values.confirm) {
            return alert("Passwörter stimmen nicht überein");
        }

        const {confirm: _, ...payload} = values;

        setLoading(true);
        try {
            const res = await fetch(`${apiUrl}/api/users`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error(await res.text());
            navigate("/login");
        } catch (err) {
            alert("Registrierung fehlgeschlagen: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <UserForm
            initialValues={initialValues}
            fieldsConfig={fieldsConfig}
            onSubmit={handleSubmit}
            submitText="Register"
            loading={loading}
        />
    );
}
