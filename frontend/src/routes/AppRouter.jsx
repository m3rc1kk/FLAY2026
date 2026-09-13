import { Routes, Route } from 'react-router-dom'
import Main from "../pages/Main/Main.jsx";

export default function AppRouter() {
    return (
        <>
            <Routes>
                <Route path="/" element={<Main />} />
            </Routes>
        </>
    );
}