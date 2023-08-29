import React, { useState } from 'react';
import backArrow from '../images/arrowBack.svg';
import axios from 'axios';
import close from "../images/close.svg"

function AddTransactionPopup({ coin, onClose, reloadDash }) {
  const [transactionType, setTransactionType] = useState('buy');
  const [pricePerCoin, setPricePerCoin] = useState('');
  const [quantity, setQuantity] = useState('');
  const [totalSpent, setTotalSpent] = useState('');
  const [totalReceived, setTotalReceived] = useState('');
  const [transactionDate, setTransactionDate] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const errorCheck = () => {
    const errors = {};

    // Check for empty fields
    if (!pricePerCoin) {
      errors.pricePerCoin = 'Price per Coin is required';
    }
    if (!quantity) {
      errors.quantity = 'Quantity is required';
    }
    if (!transactionDate) {
      errors.transactionDate = 'Transaction Date is required';
    }

    if (transactionType === 'buy' && !totalSpent) {
      errors.totalSpent = 'Total Spent is required';
    }
    if (transactionType === 'sell' && !totalReceived) {
      errors.totalReceived = 'Total Received is required';
    }

    // Set validation errors
    setValidationErrors(errors);

    // Return whether there are errors
    return Object.keys(errors).length === 0;
  };
  const handleSubmit = async () => {
    try {
      const hasNoErrors = errorCheck();
      
      if (!hasNoErrors) {
        return; // Don't proceed if there are errors
      }
      const token = localStorage.getItem('token');
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      // Prepare the data for the POST request
      const transactionData = {
        crypto_id: coin.id,
        transaction_type: transactionType,
        transaction_date: transactionDate,
        quantity: parseFloat(quantity),
        price_per_unit: parseFloat(pricePerCoin),
        total_amount: parseFloat(totalSpent || totalReceived),
      };

      // Send the POST request
      const response = await axios.post(
        'http://localhost:8000/api/transaction/add',
        transactionData,
        { headers }
      );

      setValidationErrors({});
      onClose()
      reloadDash()
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  return (
    <div className="add-txn-popup">
      <img src={close} onClick={onClose} className="closeLogo" />
      <h2>Add Transaction</h2>
      <div className="transaction-type">
        <button
            className={transactionType === 'buy' ? 'selected-buy' : ''}
            onClick={() => setTransactionType('buy')}
        >
            Buy
        </button>
        <button
            className={transactionType === 'sell' ? 'selected-sell' : ''}
            onClick={() => setTransactionType('sell')}
        >
            Sell
        </button>
        </div>
        <div className="transaction-formAdd">
            <div className='inputContainerAdd'> 
              <div className="input-groupAdd">
                  <input
                  type="number"
                  placeholder="Price per Coin"
                  value={pricePerCoin}
                  minLength={1}
                  maxLength={16}
                  onChange={(e) => setPricePerCoin(e.target.value)}
                  />
                  <span>USD</span>
              </div>
              {validationErrors.pricePerCoin && (
                    <span className="error-msg">{validationErrors.pricePerCoin}</span>
                  )}
            </div>
            <div className='inputContainerAdd'> 
              <div className="input-groupAdd">
                  <input
                  type="number"
                  placeholder="Quantity"
                  value={quantity}
                  minLength={1}
                  maxLength={30}
                  onChange={(e) => setQuantity(e.target.value)}
                  />
                  <span> {coin.coinSymbol} </span>
              </div>
              {validationErrors.quantity && (
                <span className="error-msg">{validationErrors.quantity}</span>
                )}
            </div>
            <div className='inputContainerAdd'> 
            {transactionType === 'buy' && (
                <div className="input-groupAdd">
                <input
                    type="number"
                    placeholder="Total Spent"
                    value={totalSpent}
                    minLength={1}
                    maxLength={30}
                    onChange={(e) => setTotalSpent(e.target.value)}
                />
                 <span className="unit-text">USD</span>
                </div>
            )}
            {transactionType === 'buy' && validationErrors.totalSpent && (
            <span className="error-msg">{validationErrors.totalSpent}</span>
            )}
      </div>
          <div className='inputContainerAdd'> 
            {transactionType === 'sell' && (
                <div className="input-groupAdd">
                <input
                    type="number"
                    placeholder="Total Received"
                    value={totalReceived}
                    minLength={1}
                    maxLength={40}
                    onChange={(e) => setTotalReceived(e.target.value)}
                />
                <span>USD</span>
                </div>
            )}
             {transactionType === 'sell' && validationErrors.totalReceived && (
                <span className="error-msg">{validationErrors.totalReceived}</span>
              )}
        </div>
        <div className='inputContainerAdd'>
            <div className="input-groupAdd">
                <input
                type="date"
                placeholder="Transaction Date"
                value={transactionDate}
                minLength={1}
                maxLength={20}
                onChange={(e) => setTransactionDate(e.target.value)}
                />
            </div>
                {validationErrors.transactionDate && (
              <span className="error-msg">{validationErrors.transactionDate}</span>
            )}
            </div>
            </div>
      <div className="form-buttons">
        <button onClick={onClose}>Cancel</button>
        <button onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  );
}

export default AddTransactionPopup;