import {useEffect, useState} from "react";
import {
    Box,
    Paper,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Stack
} from "@mui/material";
import {DataGrid} from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import EditUserForm from "../components/EditUserForm";

export default function AdminUsers() {
    const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8443";
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editUser, setEditUser] = useState(null);

    // 1) User laden
    useEffect(() => {
        fetch(`${apiUrl}/api/users`, {
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => setUsers(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [apiUrl]);

    // 2) Löschen
    const handleDelete = async (id) => {
        if (!confirm("User wirklich löschen?")) return;
        await fetch(`${apiUrl}/api/users/${id}`, {
            method: "DELETE",
            credentials: "include",
        });
        setUsers((u) => u.filter((x) => x.id !== id));
    };

    // 3) Spalten definieren
    const columns = [
        {field: "id", headerName: "ID", width: 70},
        {field: "username", headerName: "Username", width: 150},
        {field: "email", headerName: "E-Mail", width: 200},
        {field: "firstName", headerName: "Vorname", width: 120},
        {field: "lastName", headerName: "Nachname", width: 120},
        {field: "phoneNumber", headerName: "Telefon", width: 140},
        {field: "address", headerName: "Adresse", width: 200},
        {field: "city", headerName: "Stadt", width: 120},
        {field: "postalCode", headerName: "PLZ", width: 100},
        {field: "country", headerName: "Land", width: 120},
        {
            field: "roles",
            headerName: "Rollen",
            width: 180,
            renderCell: ({value}) => {
                if (!Array.isArray(value) || value.length === 0) return "";
                return value.join(", ");
            },
        },
        {
            field: "actions",
            headerName: "Aktionen",
            width: 140,
            sortable: false,
            renderCell: ({row}) => (
                <Stack direction="row" spacing={1}>
                    <IconButton
                        size="small"
                        onClick={() => setEditUser(row)}
                        color="primary"
                    >
                        <EditIcon/>
                    </IconButton>
                    <IconButton
                        size="small"
                        onClick={() => handleDelete(row.id)}
                        color="error"
                    >
                        <DeleteIcon/>
                    </IconButton>
                </Stack>
            ),
        },
    ];

    return (
        <Box
            sx={{
                maxWidth: 1650,
                height: 600,
                mx: "auto",
                my: 4,
            }}
        >
            <Box sx={{flexGrow: 1, mb: 2}}>
                <DataGrid
                    rows={users}
                    columns={columns}
                    loading={loading}
                    pageSize={10}
                    rowsPerPageOptions={[10]}
                    disableSelectionOnClick
                />
            </Box>

            {editUser && (
                <EditUserForm
                    user={editUser}
                    open={!!editUser}
                    onClose={() => setEditUser(null)}
                    onSaved={(updated) => {
                        setUsers((u) =>
                            u.map((x) => (x.id === updated.id ? updated : x))
                        );
                        setEditUser(null);
                    }}
                    apiUrl={apiUrl}
                />
            )}
        </Box>
    );
}
