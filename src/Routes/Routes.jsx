import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoutes";
import LoginPage from "../components/AuthPages/LoginPage";
import SingupPage from "../components/AuthPages/SignupPage";
import HomePage from "../components/HomePage/HomePage";
import DataSource from "../components/DataSource/DataSource";
import NotePad from "../components/NotePad/NotePad";
import NotFoundPage from "../components/404Page";
import SessionExpired from "../components/SessionExpired";
import Chat from "../components/Chat/Chat";
import Dashboard from "../components/Dashboard/Dashboard";
import Profile from "../components/ProfilePage/ProfilePage";

function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SingupPage />} />
        <Route path="/" element={<LoginPage />} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/session-expired" element={<SessionExpired />} />
        <Route path="/profile" element={<Profile />} />

        {/* Protected Routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/datasource"
          element={
            <ProtectedRoute>
              <DataSource />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notepad"
          element={
            <ProtectedRoute>
              <NotePad />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default AppRouter;
