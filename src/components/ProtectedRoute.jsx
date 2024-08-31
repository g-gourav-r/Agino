import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    // If no token is found, redirect to the login page
    return <Navigate to="/user/login" />;
  }

  // If the token is present, render the protected component
  return children;
};

export default ProtectedRoute;
