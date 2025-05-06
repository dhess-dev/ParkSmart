import {BrowserRouter, Routes, Route} from "react-router-dom";
import Layout from "./Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import {useState, useEffect} from "react";

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("isLoggedIn") === "true";
        setIsLoggedIn(stored);
    }, []);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout/>}>
                    {/* public routes */}
                    <Route index element={<Home/>}/>
                    <Route path="about" element={<About/>}/>
                    <Route path="dashboard" element={<Dashboard/>}/>
                    <Route path="login" element={<Login onLogin={() => setIsLoggedIn(true)}/>}/>

                    {/* protected */}
                    <Route
                        path="profile"
                        element={
                            <ProtectedRoute isLoggedIn={isLoggedIn}>
                                <Profile/>
                            </ProtectedRoute>
                        }
                    />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
