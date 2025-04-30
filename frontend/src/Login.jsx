import React, { useState } from "react";
import { TextField, Button, Typography, Box } from "@mui/material";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.text();

      if (response.ok && result === "Login successful") {
        setMessage(result); // Show success message
        onLogin(); // Notify App.jsx of successful login
      } else {
        setMessage(result); // Show error message
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
      console.error("Error:", error);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleLogin}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        maxWidth: 400,
        margin: "auto",
        mt: 5,
      }}
    >
      <Typography variant="h4" component="h1" align="center">
        Login
      </Typography>
      <TextField
        label="Username"
        variant="outlined"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <TextField
        label="Password"
        type="password"
        variant="outlined"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <Button type="submit" variant="contained" color="secondary">
        Login
      </Button>
      {message && (
        <Typography color="error" align="center">
          {message}
        </Typography>
      )}
    </Box>
  );
}

export default Login;
