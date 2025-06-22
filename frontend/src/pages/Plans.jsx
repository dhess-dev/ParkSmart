import { useEffect, useState } from "react";
import { Card, CardContent, CardActions, Button, Typography, Grid } from "@mui/material";

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
    <div>
      <h2>Parkplatz buchen</h2>
      <Grid container spacing={3}>
        {plans.map((plan) => (
          <Grid item xs={12} sm={6} md={4} key={plan.id}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  {plan.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {plan.description}
                </Typography>
                <Typography variant="h6" color="text.primary">
                  {plan.price} €
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {plan.duration} {plan.duration > 1 ? "Tage" : "Tag"}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handlePurchase(plan.id)}
                >
                  Buchen
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}