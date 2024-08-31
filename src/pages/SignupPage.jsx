import React, { useState } from 'react';
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../assets/css/AuthPage.css';

const SignupPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset messages
    setError('');
    setSuccess('');

    // Validate form fields
    if (!username || !email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message); // Display success message
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      } else {
        setError(data.message || 'An error occurred');
      }
    } catch (error) {
      console.error('Error during signup:', error);
      setError('Server error. Please try again later.');
    }
  };

  return (
    <div className="container d-flex align-items-center" style={{ height: '100vh' }}>
      <div className="row w-100">
        <div className="col-md-6 d-flex justify-content-center align-items-center">
          <div className="wrapper">
            <form onSubmit={handleSubmit}>
              <h1 className="text-center">Signup</h1>
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
                  type="email" 
                  placeholder="Email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
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
              <div className="input-box">
                <input 
                  type="password" 
                  placeholder="Confirm Password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                />
                <FaLock className='icon'/>
              </div>       
              {error && <div className="error-message pt-3 text-center text-danger">{error}</div>}
              {success && <div className="success-message pt-3 text-center text-success">{success}</div>}
              <div className="my-4">
                <button type="submit" className="btn btn-primary w-100">Signup</button>
              </div>
              <div className="register-link text-center">
                <p>Already have an account? <a href="/user/login">Login</a></p>    
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

export default SignupPage;
