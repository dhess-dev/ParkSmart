import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline, GlobalStyles } from "@mui/material";

import Layout from "./Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import Bookings from "./pages/Bookings";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Register from "./pages/Register.jsx";
import Plans from "./pages/Plans.jsx";

export default function App() {
  const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8443";
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState(() => {
    return localStorage.getItem("colorMode") || "light";
  });

  useEffect(() => {
    localStorage.setItem("colorMode", mode);
  }, [mode]);

  const theme = createTheme({
    palette: {
      mode: mode,
      background: {
        default: mode === "dark" ? "hsl(230, 17%, 14%)" : "#003366",
      },
    },
    components: {
      // 1️⃣ Text colour inside the input
      MuiInputBase: {
        styleOverrides: {
          input: {
            color: "#ffffff", // white text
          },
          root: {
            // also make the placeholder white(ish)
            "& .MuiInputBase-input::placeholder": {
              color: "rgba(255,255,255,0.7)",
              opacity: 1,
            },
          },
        },
      },

      // 2️⃣ Label colour
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: "#ffffff",
            "&.Mui-focused": {
              color: "#ffffff",
            },
          },
        },
      },

      // 3️⃣ Outlined border colour
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(255,255,255,0.5)",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#ffffff",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#ffffff",
            },
          },
        },
      },
    },
  });
  const globalStyles = (
    <GlobalStyles
      styles={{
        body: {
          background:
            mode === "light"
              ? "linear-gradient(to bottom, #001F3F, #003366)"
              : "hsl(230, 17%, 14%)",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          minHeight: "100vh",
          margin: 0,
        },
      }}
    />
  );

  // Fetch current user on startup
  useEffect(() => {
    fetch(`${apiUrl}/api/users/me`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("not logged in");
        return res.json();
      })
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [apiUrl]);

  if (loading) return <p>Loading…</p>;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {globalStyles}
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <Layout
                user={user}
                onLogout={() => {
                  // call your logout endpoint to clear the session cookie,
                  // then clear local user state:
                  fetch(`${apiUrl}/api/users/logout`, {
                    method: "POST",
                    credentials: "include",
                  }).finally(() => setUser(null));
                }}
                mode={mode}
                setMode={setMode}
              />
            }
          >
            {/* Public */}
            <Route index element={<Home />} />
            <Route path="register" element={<Register />} />
            <Route
              path="login"
              element={
                <Login
                  onLogin={() => {
                    // after successful login, re-fetch /me:
                    fetch(`${apiUrl}/api/users/me`, { credentials: "include" })
                      .then((r) => {
                        if (!r.ok) throw new Error("Failed to fetch user data");
                        return r.json();
                      })
                      .then(setUser)
                      .catch(() => setUser(null));
                  }}
                />
              }
            />

            {/* Authenticated */}
            <Route
              path="profile"
              element={
                <ProtectedRoute user={user}>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="plans"
              element={
                <ProtectedRoute user={user}>
                  <Plans />
                </ProtectedRoute>
              }
            />
            <Route
              path="bookings"
              element={
                <ProtectedRoute user={user}>
                  <Bookings />
                </ProtectedRoute>
              }
            />

            {/* Admin only */}
            <Route
              path="admin"
              element={
                <AdminRoute user={user}>
                  <Admin />
                </AdminRoute>
              }
            />
            <Route
              path="dashboard"
              element={
                <AdminRoute user={user}>
                  <Dashboard />
                </AdminRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
