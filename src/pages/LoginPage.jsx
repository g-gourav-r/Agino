import React, { useState } from 'react';
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import '../assets/css/AuthPage.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset the error state
    setError('');

    // Check if any field is empty
    if (!username || !password) {
      setError('Both fields are required');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store JWT token and email in localStorage (or sessionStorage)
        localStorage.setItem('token', data.token);
        localStorage.setItem('email', username);  // Store the email/username

        // Redirect to homepage
        navigate('/');
      } else {
        setError(data.message || 'Invalid username or password');
      }
    } catch (err) {
      console.error('Error during login:', err);
      setError('Server error. Please try again later.');
    }
  };

  return (
    <div className="container d-flex align-items-center bg-light" style={{ height: '100vh' }}>
      <div className="row w-100">
        <div className="col-md-6 d-flex justify-content-center align-items-center">
          <div className="wrapper">
            <form onSubmit={handleSubmit}>
              <h1 className="text-center">Login</h1>
              <div className="input-box">
                <input 
                  type="text" 
                  placeholder="Email ID" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                />
                <FaEnvelope className='icon'/>
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
              {error && <div className="error-message text-center pt-3 text-danger">{error}</div>}
              <div className="remember-forgot py-3 text-center">
                <a href="#">Forgot Password?</a>
              </div>         
              <button type="submit" className="btn btn-primary w-100">Login</button>
              <div className="register-link text-center">
                <p>Don't have an account? <a href="/user/signup">Register</a></p>    
              </div> 
            </form>
          </div>
        </div>
        <div className="col-md-6 d-flex justify-content-center align-items-center bg-light">
          <h1 className="display-4 text-primary"><strong>Agino</strong></h1>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
