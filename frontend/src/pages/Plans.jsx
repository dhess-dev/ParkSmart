import { useEffect, useState } from "react";
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

  useEffect(() => {
    fetch(`${apiUrl}/api/plans`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then(setPlans)
      .catch((err) => console.error("Failed to fetch plans:", err));
  }, []);

  const handlePurchase = (planId) => {
    fetch(`${apiUrl}/api/plans/purchase`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    })
      .then((res) => {
        if (res.ok) {
          alert("Plan purchased and booking created successfully!");
        } else {
          alert("Failed to purchase plan.");
        }
      })
      .catch((err) => console.error("Failed to purchase plan:", err));
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
    </Box>
  );
}