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

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if any field is empty
    if (!username || !email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    // Handle successful form submission here
    console.log('Form submitted successfully');
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
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
          {error && <div className="error-message pt-3 text-center">{error}</div>}
          <div className="my-4">
            <button type="submit" className="btn btn-primary w-100">Signup</button>
          </div>
          <div className="register-link text-center">
            <p>Already have an account? <a href="/user/login">Login</a></p>    
          </div> 
        </form>
      </div>
    </div>
  );
};


export default SignupPage;