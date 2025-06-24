import { Outlet, Link, useNavigate, useLocation  } from "react-router-dom";
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Tooltip,
  Menu,
  MenuItem,
  Button,
  Switch,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useState } from "react";

export default function Layout({ user, onLogout, mode, setMode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const pageTitle = {
    "/": "Home",
    "/about": "About",
    "/dashboard": "Dashboard",
    "/bookings": "My Bookings",
    "/plans": "Book Plans",
    "/profile": "Profile",
    "/admin": "Admin",
    "/login": "Login",
    "/register": "Register",
  };
  const currentPage = pageTitle[location.pathname] || "My App";
  const drawer = (
    <Box sx={{ textAlign: "center" }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        My App
      </Typography>
      <Divider />
      <List>
        {[
          { label: "Home", to: "/" },
          { label: "About", to: "/about" },
          { label: "Dashboard", to: "/dashboard" },
          { label: "My Bookings", to: "/bookings" },
          { label: "Book Plans", to: "/plans" },
          ...(user
            ? [
                { label: "Profile", to: "/profile" },
                ...(user.roles.includes("ADMIN")
                  ? [{ label: "Admin", to: "/admin" }]
                  : []),
              ]
            : []),
        ].map((item) => (
          <ListItem
            button
            key={item.to}
            component={Link}
            to={item.to}
            onClick={() => setMobileOpen(false)}
          >
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: 1201 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen((o) => !o)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap>
            {currentPage}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />

          {/* Theme Switch */}
          <Switch
            checked={mode === "dark"}
            onChange={() => setMode(mode === "light" ? "dark" : "light")}
            color="default"
          />

                    {user ? (
                        <>
                            <Tooltip title="User menu">
                                <IconButton onClick={e => setAnchorEl(e.currentTarget)} sx={{p: 0}}>
                                    <Avatar>{user.username[0].toUpperCase()}</Avatar>
                                </IconButton>
                            </Tooltip>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={() => setAnchorEl(null)}
                            >
                                <MenuItem onClick={() => {
                                    setAnchorEl(null);
                                    navigate("/profile");
                                }}>
                                    Profile
                                </MenuItem>
                                {user.roles.includes("ADMIN") && (
                                    <MenuItem onClick={() => {
                                        setAnchorEl(null);
                                        navigate("/admin");
                                    }}>
                                        Admin
                                    </MenuItem>
                                )}
                                <MenuItem onClick={() => {
                                    setAnchorEl(null);
                                    onLogout();
                                }}>
                                    Logout
                                </MenuItem>
                            </Menu>
                        </>
                    ) : (
                        <>
                            <Button
                                component={Link}
                                to="/register"
                                color="inherit"
                                sx={{mr: 1}}
                            >
                                Register
                            </Button>
                            <Button
                                component={Link}
                                to="/login"
                                color="inherit"
                            >
                                Login
                            </Button>
                        </>
                    )}
                </Toolbar>
            </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{ "& .MuiDrawer-paper": { width: 240 } }}
      >
        {drawer}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
