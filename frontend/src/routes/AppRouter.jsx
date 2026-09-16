import { Routes, Route } from 'react-router-dom'
import Main from "../pages/Main/Main.jsx";
import Auth from "../pages/Auth/Auth.jsx";
import Nominees from "../pages/Nominees/Nominees.jsx";

export default function AppRouter() {
    return (
        <>
            <Routes>
                <Route path="/" element={<Main />}>
                    <Route path="nominations/:number" element={<Nominees />} />
                </Route>
                <Route path="/auth" element={<Auth />} />
            </Routes>
        </>
    );
}