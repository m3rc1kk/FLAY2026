import { Routes, Route } from 'react-router-dom'
import Main from "../pages/Main/Main.jsx";
import Auth from "../pages/Auth/Auth.jsx";

export default function AppRouter() {
    return (
        <>
            <Routes>
                <Route path="/" element={<Main />} />
                <Route path="/auth" element={<Auth />} />
            </Routes>
        </>
    );
}