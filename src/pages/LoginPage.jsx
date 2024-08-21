import React, { useState } from 'react';
import { FaUser, FaLock } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import '../assets/css/AuthPage.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate(); // Initialize navigate

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if any field is empty
    if (!username || !password) {
      setError('Both fields are required');
      return;
    }

    // Redirect to /homepage if username and password are "admin"
    if (username === "admin" && password === "admin") {
      navigate('/homepage'); // Use navigate to redirect
      return;
    }

    setError('');
    // Handle other successful form submission cases here
    console.log('Form submitted successfully');
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <div className="wrapper">
        <form onSubmit={handleSubmit}>
          <h1 className="text-center">Login</h1>
          <div className="input-box">
            <input 
              type="text" 
              placeholder="Username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
            />
            <FaUser className='icon'/>
          </div>
          <div className="input-box">
            <input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
            <FaLock className='icon'/>
          </div>  
          {error && <div className="error-message text-center pt-3">{error}</div>}
          <div className="remember-forgot py-3 text-center">
            <a href="#">Forgot Password?</a>
          </div>         
          <button type="submit" className="btn btn-primary w-100">Login</button>
          <div className="register-link text-center">
            <p>Don't have an account? <a href="/signup">Register</a></p>    
          </div> 
        </form>
      </div>
    </div>
  );
};


export default LoginPage;