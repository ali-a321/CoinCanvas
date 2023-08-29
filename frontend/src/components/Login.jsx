import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login({setRenderLogin, setRenderRegister, errors, setError}) {
 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (username.length < 2) {
      setError('Minimum username length is 2 characters');
      return;
    }
    if (password.length < 5) {
      setError('Minimum password length is 5 characters');
      return;
    }
    try {
      const response = await axios.post("http://localhost:8000/api/users/login", {
        username,
        password,
      });
  
      if (response.status === 200) {
        const { token, username } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);
        console.log('Login successful');
  
        try {
          const cryptoHoldings = await axios.get("http://localhost:8000/api/crypto/get", {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
  
          if (cryptoHoldings.status === 200) {
            const userDataHoldings = cryptoHoldings.data;
            setUsername('');
            setPassword('');
            setError('');
            navigate('/dashboard');
          } else {
            setError('Error retrieving user details');
          }
        } catch (error) {
          setError('Error retrieving user details');
        }
  
        setRenderLogin(false);
      } 
    } catch (error) {
      setError('Error during login');
    }
  };

  const showRegister = () => {
    setRenderRegister(true);
    setRenderLogin(false);
    setUsername('');
    setPassword('');
    setError('');
  };


  return (
    <>
      <div className="login-container">
        <h2>Login</h2>
        <form className="login-form" onSubmit={handleLogin}>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
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

          <button type="submit">Login</button>
          {errors && <div className="error-message">{errors}</div>}
          <div onClick={showRegister}>Don't have an account? Register here</div>
        </form>

      </div>
    </>
  );
}

export default Login;
