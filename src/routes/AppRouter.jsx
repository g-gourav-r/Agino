import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import AginoPage from '../pages/AginoPage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import ConversationWindow from '../pages/ConversationWindow';
import NotePad from '../pages/NotePad';
import NoteEditor from '../components/NoteEditor';
import NotFoundPage from '../pages/404';

function AppRouter() {
    return (
      <Router>
        <Routes>
            <Route path="/" element={<AginoPage />} />
            <Route path="/user/login" element={<LoginPage />} />
            <Route path="/user/signup" element={<SignupPage />} />
            <Route path="/chat" element={<ConversationWindow />} />
            <Route path="/notes/" element={<NotePad />}>
                <Route path="note/:id" element={<NoteEditor />} />
                <Route path="create" element={<NoteEditor />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    );
  }
  
  export default AppRouter;