import React, { useState, useEffect } from 'react';
import axios from 'axios';
import closeIcon from "../images/close.svg"

function debounce(func, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}

function CryptoSearch( { reloadDash }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [cryptoOptions, setCryptoOptions] = useState([]);
  const [showAddCoinPopup, setShowAddCoinPopup] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [coinError, setcoinError] = useState('');



  useEffect(() => {
    const fetchCryptoOptions = async () => {
      try {
        const response = await axios.get(`https://api.coingecko.com/api/v3/search?query=${searchTerm}`);
        const options = response.data.coins; 
        setCryptoOptions(options);
      } catch (error) {
        console.error('Error fetching crypto options:', error);
      }
    };
  
    let searchTimeout; // Declare searchTimeout
    const debounceDelay = 500; // Declare debounceDelay
  
    clearTimeout(searchTimeout); // Clear any previous timeouts
  
    if (searchTerm) {
      // Set a new timeout to fetch options after debounceDelay
      searchTimeout = setTimeout(fetchCryptoOptions, debounceDelay);
    } else {
      // Clear options if search term is empty
      setCryptoOptions([]);
    }
  }, [searchTerm]);

  const handleSelectCoin = (coin) => {
    setSelectedCoin(coin);
    setShowAddCoinPopup(true);
    setSearchTerm(''); 
    setCryptoOptions([]); 
    setcoinError('')
  };

  const handleAddCoin = async () => {
    try {
        const token = localStorage.getItem('token');
        console.log(selectedCoin.api_symbol)
        const headers = {
          Authorization: `Bearer ${token}`,
        };
    
        const response = await axios.post(
          'http://localhost:8000/api/crypto/add',
          {
            symbol: selectedCoin.api_symbol,
          },
          { headers }
        );
        // Handle success or show message

        console.log('Coin added:', response.data);
        setShowAddCoinPopup(false);
        setSearchTerm(''); 
        setCryptoOptions([]); 
        reloadDash()
    } catch (error) {
      if (error.response && error.response.status === 400) {
          setcoinError("Coin already in portfolio")
          console.error('Error adding coin:', error.response.data.message);
      } else {
          console.error('Error adding coin:', error);
      }
  }
  };

  return (
    <div>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search"
          className="search-input"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <button className="search-button">Search</button>
      </div>
      {cryptoOptions.length > 0 && (
        <div className="crypto-options">
          <p>Cryptocurrencies</p>
          <ul>
            {cryptoOptions.map(option => (
                <li key={option.id} onClick={() => handleSelectCoin(option)}>
                <img src={option.thumb} alt={option.name} />
                <span>{option.name}</span>
                <span> ({option.symbol})</span>
                </li>
            ))}
           </ul>
        </div>
      )}
        {showAddCoinPopup && selectedCoin && (
        <div className="add-coin-popup">
           <img src={closeIcon} alt="Close Icon" className='closeLogo' onClick={()=>setShowAddCoinPopup(false)} />
          <h2>Add coin to portfolio</h2>
          <img src={selectedCoin.large} alt={selectedCoin.name} className='largeAddLogo'/>
          <p>{selectedCoin.name}</p>
          <p>{selectedCoin.symbol}</p>
          {coinError ? (
              <p className="error-message">Coin already in portfolio</p>
            ) : (
              <button onClick={handleAddCoin}>Add</button>
            )}
          </div>
      )}
    </div>
  );
}

export default CryptoSearch;