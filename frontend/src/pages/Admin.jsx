import { useEffect, useState } from "react";

export default function Admin() {
    const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8443";
    const [stats, setStats] = useState(null);
    useEffect(() => {
        fetch(`${apiUrl}/api/admin/stats`, {
            credentials: "include"
        })
            .then(res => {
                if (!res.ok) throw new Error("Not authorized");
                return res.json();
            })
            .then(setStats)
            .catch(console.error);
    }, []);
    if (!stats) return <p>Loading admin data…</p>;
    return <pre>{JSON.stringify(stats, null,2)}</pre>;
}
