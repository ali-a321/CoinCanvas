import React, { useState } from 'react';
import Login from '../components/Login';
import Register from '../components/Register'; 
import logo from "../images/coinCanvas.png"

function LandingPage() {
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
    <div className='landingPageContainer'>
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
        <div className="landing-page">
            <header className="hero">
                <div className="hero-content">
                <h1>Track Your Crypto Portfolio</h1>
                <div  className="cta-button"  onClick={showRegister}>
                    Get Started
                </div>
                </div>
                <div className="hero-image">
                 
                </div>
            </header>
            <section className="features">
                <div className="feature">
                <h2>Real-Time Tracking</h2>
                <p>Monitor the value of your crypto holdings in real-time. Stay ahead of market trends.</p>
                </div>
                <div className="feature">
                <h2>Diversified Portfolio</h2>
                <p>Manage multiple cryptocurrencies in one place. Stay organized and track performance.</p>
                </div>
                <div className="feature">
                <h2>Historical Insights</h2>
                <p>View historical data to analyze your portfolio's growth over time. Make informed decisions.</p>
                </div>
            </section>
            <section className="cta">
                <h2>Ready to Get Started?</h2>
                <div  className="cta-button"  onClick={showRegister}>
                Sign Up Now
                </div>
            </section>
            <footer className="footer">
                <p>&copy; {new Date().getFullYear()} CoinCanvas. All rights reserved.</p>
            </footer>
        </div>
        
    </div>
  )
}

export default LandingPage