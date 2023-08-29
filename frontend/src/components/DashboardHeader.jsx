import React, { useEffect, useState } from 'react';
import Logout from './Logout';
import logo from "../images/coinCanvas.png"

function Dashboardheader() {
  const [renderLogout, setRenderLogout] = useState(false);
  const [displayUsername, setDisplayUsername] = useState("");
  
  useEffect(() => {
    const username = localStorage.getItem('username');
    if (username) {
        setDisplayUsername(username);
    }
   }, []); 

  const showLogout = () => {
    setRenderLogout(true);
  };

  const handleClickOutside = (e) => {
    if (e.target.classList.contains('popup-container')) {
      setRenderLogout(false);

    }
  }

 
  return (
    <div className='headerContainer'>
      <div className='headerTitle'> 
      <img src={logo} alt='logo'  className='headerLogo'/>
       </div>
      <div className='loginRegisterContainer'>
        <div className='displayUsername' > {displayUsername} </div>
        <div className='loginTitle' onClick={showLogout}> Log out </div>
      </div>
      <div className={`popup-container ${renderLogout ? 'open' : ''}`} onClick={handleClickOutside}>
        <Logout />
      </div>

    </div>
  );
}

export default Dashboardheader;
