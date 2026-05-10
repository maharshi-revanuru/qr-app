import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import AdminRequests from "./pages/AdminRequests";
import AdminDashboard from "./pages/AdminDashboard";
import Users from "./pages/Users";
import Profile from "./pages/Profile"
import Verify from "./pages/Verify";
import { Navigate } from "react-router-dom";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/upload" element={<Upload />} />
      <Route path="/requests" element={<AdminRequests />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/users" element={<Users />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/verify/:token" element={<Verify />} />
      <Route path="*" element={<Navigate to="/" />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password/:token" element={<ResetPassword />} />
    </Routes>
  );
}

export default App;