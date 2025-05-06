// src/Layout.jsx
import {Outlet, Link, useNavigate} from "react-router-dom";
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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import {useState} from "react";

const drawerWidth = 240;

function Layout() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const menuOpen = Boolean(anchorEl);
    const navigate = useNavigate();

    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    const handleDrawerToggle = () => setMobileOpen((prev) => !prev);
    const handleDrawerClose = () => setMobileOpen(false);
    const handleAvatarClick = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const handleLogout = () => {
        localStorage.removeItem("isLoggedIn");
        handleMenuClose();
        navigate("/login");
    };

    const drawer = (
        <Box sx={{textAlign: "center"}}>
            <Typography variant="h6" sx={{my: 2}}>
                My App
            </Typography>
            <Divider/>
            <List>
                {[
                    {label: "Home", to: "/"},
                    {label: "About", to: "/about"},
                    {label: "Dashboard", to: "/dashboard"},
                    {label: "Profile", to: "/profile"},
                ].map((item) => (
                    <ListItem
                        button
                        key={item.to}
                        component={Link}
                        to={item.to}
                        onClick={handleDrawerClose}
                    >
                        <ListItemText primary={item.label}/>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <Box sx={{display: "flex"}}>
            <CssBaseline/>

            <AppBar position="fixed" sx={{zIndex: 1201}}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{mr: 2}}
                    >
                        <MenuIcon/>
                    </IconButton>

                    <Typography variant="h6" noWrap component="div">
                        Dashboard
                    </Typography>

                    <Box sx={{flexGrow: 1}}/>

                    {isLoggedIn ? (
                        <>
                            <Tooltip title="Open settings">
                                <IconButton onClick={handleAvatarClick} sx={{p: 0}}>
                                    <Avatar sx={{bgcolor: "secondary.main"}}>U</Avatar>
                                </IconButton>
                            </Tooltip>

                            <Menu
                                anchorEl={anchorEl}
                                open={menuOpen}
                                onClose={handleMenuClose}
                                onClick={handleMenuClose}
                                PaperProps={{
                                    elevation: 3,
                                    sx: {mt: 1.5, minWidth: 160},
                                }}
                                anchorOrigin={{
                                    vertical: "bottom",
                                    horizontal: "right",
                                }}
                                transformOrigin={{
                                    vertical: "top",
                                    horizontal: "right",
                                }}
                            >
                                <MenuItem onClick={() => navigate("/profile")}>My Info</MenuItem>
                                <MenuItem>My Billing</MenuItem>
                                <MenuItem onClick={handleLogout}>Logout</MenuItem>
                            </Menu>
                        </>
                    ) : (
                        <Button color="inherit" component={Link} to="/login">
                            Login
                        </Button>
                    )}
                </Toolbar>
            </AppBar>

            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerClose}
                ModalProps={{keepMounted: true}}
                sx={{
                    display: {xs: "block", sm: "block"},
                    "& .MuiDrawer-paper": {
                        boxSizing: "border-box",
                        width: drawerWidth,
                    },
                }}
            >
                {drawer}
            </Drawer>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: "100%",
                }}
            >
                <Toolbar/>
                <Outlet/>
            </Box>
        </Box>
    );
}

export default Layout;
