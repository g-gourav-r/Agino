import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import AginoPage from '../pages/AginoPage';
import LoginPage from '../pages/LoginPage';

function AppRouter() {
    return (
      <Router>
        <Routes>
            <Route path="/" element={<AginoPage />} />
            <Route path="/user/login" element={<LoginPage />} />
        </Routes>
      </Router>
    );
  }
  
  export default AppRouter;