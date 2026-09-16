import { Routes, Route } from 'react-router-dom'
import Main from "../pages/Main/Main.jsx";
import Auth from "../pages/Auth/Auth.jsx";
import Nominees from "../pages/Nominees/Nominees.jsx";
import NotFound from "../pages/NotFound/NotFound.jsx";
import AdminLayout from "../pages/Admin/AdminLayout.jsx";
import Dashboard from "../pages/Admin/Dashboard/Dashboard.jsx";
import NominationsList from "../pages/Admin/Nominations/NominationsList.jsx";
import NominationEdit from "../pages/Admin/Nominations/NominationEdit.jsx";
import UsersList from "../pages/Admin/Users/UsersList.jsx";
import UserDetail from "../pages/Admin/Users/UserDetail.jsx";
import VotingSettings from "../pages/Admin/Voting/Voting.jsx";

export default function AppRouter() {
    return (
        <>
            <Routes>
                <Route path="/" element={<Main />}>
                    <Route path="nominations/:number" element={<Nominees />} />
                </Route>
                <Route path="/auth" element={<Auth />} />
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="nominations" element={<NominationsList />} />
                    <Route path="nominations/:number" element={<NominationEdit />} />
                    <Route path="users" element={<UsersList />} />
                    <Route path="users/:id" element={<UserDetail />} />
                    <Route path="voting" element={<VotingSettings />} />
                </Route>
                <Route path="*" element={<NotFound />} />
            </Routes>
        </>
    );
}