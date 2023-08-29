import React, { useState } from 'react';
import Login from './Login';
import Register from './Register'; 
import logo from "../images/coinCanvas.png"

function Header() {
  const [renderRegister, setRenderRegister] = useState(false);
  const [renderLogin, setRenderLogin] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errors, setError] = useState('');
  
  const showLogin = () => {
    setRenderLogin(true);
    setRenderRegister(false);
  };

  const showRegister = () => {
    setRenderRegister(true);
    setRenderLogin(false);
  };

  const handleClickOutside = (e) => {
    if (e.target.classList.contains('popup-container')) {
      setRenderLogin(false);
      setError('')

    }
  }
  const registerClickOut = (e) => {
    if(e.target.classList.contains('registerPopup-container')) {
      setRenderRegister(false);
      setErrorMessage('')
    }
  };
  return (
    <div className='headerContainer'>
      <div className='headerTitle'> 
        <img src={logo} alt='logo'  className='headerLogo'/>
      </div>
      <div className='loginRegisterContainer'>
        <div className='loginTitle' onClick={showLogin}> Log in </div>
        <div className='signTitle' onClick={showRegister}> Sign up</div>
      </div>
      <div className={`popup-container ${renderLogin ? 'open' : ''}`} onClick={handleClickOutside}>
        <Login setRenderLogin = {setRenderLogin} setRenderRegister = {setRenderRegister} setError = {setError} errors = {errors}/>
      </div>
      <div className={`registerPopup-container ${renderRegister ? 'open' : ''}`} onClick={registerClickOut}>
          <Register setRenderRegister={setRenderRegister} showLogin={showLogin} setErrorMessage = {setErrorMessage} errorMessage={errorMessage}/>
    </div>
     
    </div>
  );
}

export default Header;
