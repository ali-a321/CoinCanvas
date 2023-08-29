import React, { useState } from 'react';
import axios from 'axios';

const Register = ({ setRenderRegister, showLogin, setErrorMessage, errorMessage }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();

    if (email.length < 6) {
      setErrorMessage('Minimum email length is 6 characters');
      return;
    }
    if (password.length < 5) {
      setErrorMessage('Minimum password length is 5 characters');
      return;
    }
    if (username.length < 2) {
      setErrorMessage('Minimum username length is 2 characters');
      return;
    }
    try {
      const response = await axios.post("http://localhost:8000/api/users", {
        username,
        email,
        password,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    
      console.log('Response:', response);
      console.log("helo")
      if (response.status === 201) {
        console.log('Registration successful');
        closeRegister();
      } else if (response.status === 409){
        setErrorMessage("Username already taken")
      } else {
        const data = response.data;
        const { message } = data;
        setErrorMessage(message || 'Registration failed');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setErrorMessage('Error during registration');
    }
  }
  const closeRegister = () => {
    setRenderRegister(false);
    showLogin();
    setEmail('');
    setUsername('');
    setPassword('');
    setErrorMessage('');
  };

  return (
    <>
      <div className="register-container">
        <h2>Register</h2>
        <form className="register-form" onSubmit={handleRegister}>
        <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            minLength={2}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            minLength={5}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {errorMessage && <div className="error-message">{errorMessage}</div>}

          <button type="submit" onClick={handleRegister}>
            Register
          </button>
          <div onClick={closeRegister} className='makeAccount'>Already have an account? Login</div>
        </form>
      </div>
    </>
  );
};

export default Register;
