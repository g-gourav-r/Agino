import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoutes";
import LoginPage from "../components/AuthPages/LoginPage";
import SingupPage from "../components/AuthPages/SignupPage";
import HomePage from "../components/HomePage/HomePage";
import DataSource from "../components/DataSource/DataSource";
import NotePad from "../components/NotePad/NotePad";
import Chat from "../components/Chat/Chat";

function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SingupPage />} />
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
      </Routes>
    </Router>
  );
}

export default AppRouter;
