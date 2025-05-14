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
        {name: "password", label: "Password", xs: 12, required: true, type: "password"},
        {name: "confirm", label: "Confirm Password", xs: 12, required: true, type: "password"},

        {name: "firstName", label: "First Name", required: true, xs: 6},
        {name: "lastName", label: "Last Name", required: true, xs: 6},
        {name: "phoneNumber", label: "Phone Number", required: false, xs: 6},
        {name: "address", label: "Address", required: false, xs: 6},
        {name: "city", label: "City", required: false, xs: 4},
        {name: "postalCode", label: "Postal Code", required: false, xs: 4},
        {name: "country", label: "Country", required: false, xs: 4},
    ];

    const handleSubmit = async (values) => {
        if (values.password !== values.confirm) {
            return alert("Passwords don’t match");
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
            alert("Register failed: " + err.message);
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
