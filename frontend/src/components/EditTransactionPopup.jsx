import React, { useState, useEffect } from 'react';
import backArrow from '../images/arrowBack.svg';
import axios from 'axios';

function EditTransactionPopup({ transaction,coin, onClose,onClosePrevious, reloadDash, closeCoinInfoPopup }) {
  const [transactionType, setTransactionType] = useState(transaction.transaction_type);
  const [pricePerCoin, setPricePerCoin] = useState(transaction.price_per_unit);
  const [quantity, setQuantity] = useState(transaction.quantity);
  const [totalSpent, setTotalSpent] = useState(
    transaction.transaction_type === 'buy' ? transaction.total_amount : ''
  );
  const [totalReceived, setTotalReceived] = useState(
    transaction.transaction_type === 'sell' ? transaction.total_amount : ''
  );
  const initialTransactionDate = transaction.transaction_date.split("T")[0];
  const [transactionDate, setTransactionDate] = useState(initialTransactionDate);
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

      const transactionData = {
        crypto_id: transaction.crypto_id, 
        transaction_type: transactionType,
        transaction_date: transactionDate,
        quantity: parseFloat(quantity),
        price_per_unit: parseFloat(pricePerCoin),
        total_amount: parseFloat(totalSpent || totalReceived),
      };
  
      const response = await axios.put(
        `http://localhost:8000/api/transaction/modify/${transaction.id}`, 
        transactionData,
        { headers }
      );
  
      setValidationErrors({});
      closeEditPopups()
      closeCoinInfoPopup()
      reloadDash()
    } catch (error) {
      console.error('Error editing transaction:', error);
    }
  };

  
  const closeEditPopups = () => {
    onClose()
    onClosePrevious()
    
  }

  return (
    <div className="edit-txn-popup">
      <img src={backArrow} onClick={closeEditPopups} className="closeArrow" />
      <h2>Edit Transaction</h2>
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
              maxLength={16}
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
            maxLength={16}
            onChange={(e) => setTransactionDate(e.target.value)}
          />
        </div>
        {validationErrors.transactionDate && (
              <span className="error-msg">{validationErrors.transactionDate}</span>
            )}
        </div>
      </div>
      <div className="form-buttons">
        <button onClick={closeEditPopups}>Cancel</button>
        <button onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  );
}

export default EditTransactionPopup;