import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import AginoPage from '../pages/AginoPage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import ConversationWindow from '../pages/ConversationWindow';
import NotePad from '../pages/NotePad';
import NoteEditor from '../components/NoteEditor';
import NotFoundPage from '../pages/404';
import DataSource from '../pages/DataSource';
import ProtectedRoute from '../components/ProtectedRoute';

function AppRouter() {
    return (
      <Router>
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><AginoPage /></ProtectedRoute>} />
            <Route path="/adddatasource" element={<ProtectedRoute><DataSource /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><ConversationWindow /></ProtectedRoute>} />
            <Route path="/notes" element={<ProtectedRoute><NotePad /></ProtectedRoute>}>
                <Route path="note/:id" element={<ProtectedRoute><NoteEditor /></ProtectedRoute>} />
                <Route path="create" element={<ProtectedRoute><NoteEditor /></ProtectedRoute>} />
            </Route>
            
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    );
}

export default AppRouter;
