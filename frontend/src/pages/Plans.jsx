import { useEffect, useState } from "react";
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import {
    Card,
    CardContent,
    CardActions,
    Button,
    Typography,
    Grid,
    Box,
    Container,
    Paper,
} from "@mui/material";
const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8443";

export default function Plans() {
  const [plans, setPlans] = useState([]);

  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "success",
    message: ""
  });

  useEffect(() => {
    fetch(`${apiUrl}/api/plans`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then(setPlans)
      .catch((err) => console.error("Failed to fetch plans:", err));
  }, []);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handlePurchase = (planId) => {
    fetch(`${apiUrl}/api/plans/purchase`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    })
      .then(async (res) => {
        const responseText = await res.text();
        if (res.ok) {
          setSnackbar({
            open: true,
            severity: "success",
            message: responseText
          });
        } else {
          setSnackbar({
            open: true,
            severity: "error",
            message: "Fehler beim Buchen:\n" + responseText
          });
        }
      })
      .catch((err) => {
        console.error("Failed to purchase plan:", err);
        setSnackbar({
          open: true,
          severity: "error",
          message: "Fehler beim Buchen: Melden Sie sich beim Kundendienst"
        });
      });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #001F3F, #003366)",
        color: "white",
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom align="center">
          Parkplatz buchen
        </Typography>

        <Grid container spacing={3}>
          {plans.map((plan) => (
            <Grid item xs={12} sm={6} md={4} key={plan.id}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: 3,
                  color: "white",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: "100%",
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="div" gutterBottom>
                    {plan.name}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {plan.description}
                  </Typography>
                  <Typography variant="h6">{plan.price} €</Typography>
                  <Typography variant="body2">
                    {plan.duration} {plan.duration > 1 ? "Tage" : "Tag"}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={() => handlePurchase(plan.id)}
                    sx={{ mt: 2 }}
                  >
                    Buchen
                  </Button>
                </CardActions>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
        <Snackbar
            open={snackbar.open}
            autoHideDuration={5000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
            <Alert
                onClose={handleCloseSnackbar}
                severity={snackbar.severity}
                sx={{
                    whiteSpace: 'pre-line',
                    width: '100%',
                    fontSize: '1.0rem',
                    padding: '10px',
                }}
            >
                {snackbar.message}
            </Alert>
        </Snackbar>
    </Box>
  );
}