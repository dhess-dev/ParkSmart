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
        { field: "id", headerName: "ID", flex: 0.2, minWidth: 60 },

        // regular columns
        { field: "username",   headerName: "Username",   flex: 1 },
        { field: "email",      headerName: "E-Mail",     flex: 1.2 },
        { field: "firstName",  headerName: "Vorname",    flex: 0.8 },
        { field: "lastName",   headerName: "Nachname",   flex: 0.8 },
        { field: "phoneNumber",headerName: "Telefon",    flex: 0.8 },
        { field: "address",    headerName: "Adresse",    flex: 1.3, minWidth: 180 },
        { field: "city",       headerName: "Stadt",      flex: 0.9 },
        { field: "postalCode", headerName: "PLZ",        flex: 0.6 },
        { field: "country",    headerName: "Land",       flex: 0.9 },

        {
            field: "roles",
            headerName: "Rollen",
            flex: 0.9,
            renderCell: ({ value }) => Array.isArray(value) ? value.join(", ") : "",
        },
        {
            field: "actions",
            headerName: "Aktionen",
            flex: 0.8,
            sortable: false,
            renderCell: ({ row }) => (
                <Stack direction="row" spacing={1}>
                    <IconButton size="small" onClick={() => setEditUser(row)} color="primary">
                        <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(row.id)} color="error">
                        <DeleteIcon />
                    </IconButton>
                </Stack>
            ),
        },
    ];

    return (
        <Box
            sx={{
                minHeight: 'calc(100vh - 100px)',
                width: '100%',
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                px: 2,
                py: 4,
                boxSizing: 'border-box',
            }}
        >

            <Box
                sx={{
                    width: "100%",
                    maxWidth: "1400px",
                    overflowX: "auto",
                    mb: 2,
                }}
            >
                <DataGrid
                    rows={users}
                    columns={columns}
                    loading={loading}
                    pageSize={10}
                    rowsPerPageOptions={[10]}
                    disableSelectionOnClick
                    sx={{
                        color: "white",
                        borderColor: "white",
                        '& .MuiDataGrid-cell': {
                            color: "white",
                        },
                        '& .MuiDataGrid-columnHeader': {
                            color: "white",
                        },
                        '& .MuiTablePagination-root': {
                            color: "white",
                        },
                        maxHeight: "80vh"
                    }}
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
