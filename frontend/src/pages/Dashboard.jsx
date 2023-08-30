import React, { useState, useEffect } from 'react';
import Dashboardheader from '../components/DashboardHeader'
import axios from 'axios';
import {Chart, ArcElement, Tooltip, Legend } from 'chart.js'
import {Pie} from 'react-chartjs-2'
import backArrow from '../images/arrowBack.svg'
import CryptoSearch from '../components/CryptoSearch';
import AddTransactionPopup from '../components/AddTransactionPopup';
import EditTransactionPopup from '../components/EditTransactionPopup';
import LineGraph from '../components/LineGraph';

Chart.register(
  ArcElement,
  Tooltip,
  Legend
);

function Dashboard() {
  const [totalPortfolioValue, setTotalPortfolioValue] = useState(0);
  const [totalInvestmentChange, setTotalInvestmentChange] = useState(0);
  const [performanceChange, setPerformanceChange] = useState(0);
  const [coinHoldings, setCoinHoldings] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [coinIds, setCoinIds ] = useState([])
  const [showAddTransactionPopup, setShowAddTransactionPopup] = useState(false);
  const [showCoinInfoPopup, setshowCoinInfoPopup] = useState(false);
  const [showTransactionDetailsPopup, setShowTransactionDetailsPopup] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showEditTransactionPopup, setShowEditTransactionPopup] = useState(false);
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [showDeleteTxn, setShowDeleteTxnPopup] = useState(false)
  const [sortAscending, setSortAscending] = useState(false);

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [],
      },
    ],
  });

  const handleRowClick = (coin) => {
    setSelectedCoin(coin);
    setshowCoinInfoPopup(true)
  };

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
    
        const headers = {
          Authorization: `Bearer ${token}`,
        };
    
        const response = await axios.get("http://localhost:8000/api/crypto/get", { headers });
        const coinHoldingsData = response.data;
    
        const coinIdsArray = coinHoldingsData.map(coin => coin.id);
        setCoinIds(coinIdsArray);
  
        // Fetch transaction data for each coin and calculate total quantity
        let totalPortfolioValue = 0;
        const updatedCoinHoldings = await Promise.all(
          coinHoldingsData.map(async (coin) => {
            const formattedCryptoName = coin.crypto_name.toLowerCase().replace(/\s+/g, '-'); // Replace spaces with hyphens
            const coinGeckoResponse = await axios.get(`https://api.coingecko.com/api/v3/coins/${formattedCryptoName}`);
           
            const priceChange24h = coinGeckoResponse.data.market_data.price_change_percentage_24h;
            const currentPrice = coinGeckoResponse.data.market_data.current_price.usd;
            const coinSymbol = coinGeckoResponse.data.symbol;
            const transactionResponse = await axios.get(`http://localhost:8000/api/transaction/get/${coin.id}`, { headers });
            const transactionInfo = transactionResponse.data;
  
            // Calculate total quantity for the coin
            const totalQuantity = transactionInfo.reduce((total, transaction) => {
              if (transaction.transaction_type === 'buy') {
                return total + transaction.quantity;
              } else {
                return total - transaction.quantity;
              }
            }, 0);
          

            // Calculate net quantity and net cost for the filtered transactions
            let netQuantity = 0;
            let netCost = 0;
            
            transactionInfo.forEach(transaction => {
              if (transaction.transaction_type === 'buy') {
                netQuantity += transaction.quantity;
                netCost += transaction.total_amount;
              } else if (transaction.transaction_type === 'sell') {
                netQuantity -= transaction.quantity;
                netCost -= transaction.total_amount;
              }
            });
            
            // Calculate average purchase price
            const avgPurchasePrice = netQuantity !== 0 ? netCost / netQuantity : 0;
           

            // Accumulate holdings value for total portfolio value
            const holdingsValue = totalQuantity * currentPrice;
            totalPortfolioValue += holdingsValue;
            return {
              ...coin,
              price_change_percentage_24h: priceChange24h,
              current_price: currentPrice,
              total_quantity: totalQuantity, // Add total quantity to the coin object
              transaction_history: transactionInfo,
              avgPrice: avgPurchasePrice,
              coinSymbol: coinSymbol,
            };
          })
        );
        const sortedCoinHoldings = updatedCoinHoldings.slice().sort((a, b) => {
          const valueA = a.total_quantity * a.current_price;
          const valueB = b.total_quantity * b.current_price;
        
          return valueB - valueA; // Sort in descending order
        });
        setCoinHoldings(sortedCoinHoldings);
        setTotalPortfolioValue(totalPortfolioValue); 
        calculateTotalInvestment(sortedCoinHoldings, totalPortfolioValue)

        const chartLabels = sortedCoinHoldings.map(coin => coin.crypto_name);
       
        const portfolioPercentages = sortedCoinHoldings.map(
          coin => ((coin.total_quantity * coin.current_price) / totalPortfolioValue) * 100
        );
        const chartDataPoints = portfolioPercentages.map(percentage => parseFloat(percentage.toFixed(2)));
        
        const chartColors =  [ '#FF5733',
        '#66BB6A', 
        '#42A5F5', 
        '#FFC107',
        '#FF4081', 
        '#9C27B0',
        '#FF5722', 
        '#4CAF50',
        '#2196F3', 
        '#FF9800', ]
    
        setChartData({
          labels: chartLabels,
          datasets: [
            {
              data: chartDataPoints,
              backgroundColor: chartColors,
            },
          ],
        });
        
       
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, []);
  const options = {
    
    plugins: {
      legend: {
        display: true,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const labelValue = context.dataset.data[context.dataIndex];
            return `${labelValue}%`;
          },
        },
      },
    },
  };
    

  
 const closeCoinInfoPopup = () => {
  setshowCoinInfoPopup(null)
  setSelectedCoin(null)
  handleCancelDeleteCoin()
 }

  const openAddTransactionPopup = () => {
    setShowAddTransactionPopup(true);
    setshowCoinInfoPopup(null);
    handleCancelDeleteCoin();
  };

  const closeAddTransactionPopup = () => {
    setShowAddTransactionPopup(false);
    handleCancelDeleteCoin()
  };

 
  const handleTransactionRowClick = (transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionDetailsPopup(true);
    handleCancelDeleteCoin()
  };

  const closeTransactionDetailsPopup = () => {
    setSelectedTransaction(null);
    setShowTransactionDetailsPopup(false);
    handleCancelTxn()

  };
  const openEditTransactionForm = () => {
    setShowEditTransactionPopup(true);
    handleCancelTxn()
  };  
  const closeEditTransactionPopup = () => {
    setShowEditTransactionPopup(false);
  };

  const reloadDash = async () => {
    try {
      const token = localStorage.getItem('token');
  
      const headers = {
        Authorization: `Bearer ${token}`,
      };
  
      const response = await axios.get("http://localhost:8000/api/crypto/get", { headers });
      const coinHoldingsData = response.data;
  
      const coinIdsArray = coinHoldingsData.map(coin => coin.id);
      setCoinIds(coinIdsArray);

      // Fetch transaction data for each coin and calculate total quantity
      let totalPortfolioValue = 0;
      const updatedCoinHoldings = await Promise.all(
        coinHoldingsData.map(async (coin) => {
          const formattedCryptoName = coin.crypto_name.toLowerCase().replace(/\s+/g, '-'); // Replace spaces with hyphens
          const coinGeckoResponse = await axios.get(`https://api.coingecko.com/api/v3/coins/${formattedCryptoName}`);
         
          const priceChange24h = coinGeckoResponse.data.market_data.price_change_percentage_24h;
          const currentPrice = coinGeckoResponse.data.market_data.current_price.usd;
          const coinSymbol = coinGeckoResponse.data.symbol;
          const transactionResponse = await axios.get(`http://localhost:8000/api/transaction/get/${coin.id}`, { headers });
          const transactionInfo = transactionResponse.data;

          // Calculate total quantity for the coin
          const totalQuantity = transactionInfo.reduce((total, transaction) => {
            if (transaction.transaction_type === 'buy') {
              return total + transaction.quantity;
            } else {
              return total - transaction.quantity;
            }
          }, 0);
        

          //Calculate average purchase price for the coin
          // Calculate net quantity and net cost for the filtered transactions
          let netQuantity = 0;
          let netCost = 0;
          
          transactionInfo.forEach(transaction => {
            if (transaction.transaction_type === 'buy') {
              netQuantity += transaction.quantity;
              netCost += transaction.total_amount;
            } else if (transaction.transaction_type === 'sell') {
              netQuantity -= transaction.quantity;
              netCost -= transaction.total_amount;
            }
          });
          
          // Calculate average purchase price
          const avgPurchasePrice = netQuantity !== 0 ? netCost / netQuantity : 0;
         

          // Accumulate holdings value for total portfolio value
          const holdingsValue = totalQuantity * currentPrice;
          totalPortfolioValue += holdingsValue;
          return {
            ...coin,
            price_change_percentage_24h: priceChange24h,
            current_price: currentPrice,
            total_quantity: totalQuantity, // Add total quantity to the coin object
            transaction_history: transactionInfo,
            avgPrice: avgPurchasePrice,
            coinSymbol: coinSymbol,
          };
        })
      );

      setCoinHoldings(updatedCoinHoldings);
      setTotalPortfolioValue(totalPortfolioValue); 

      const chartLabels = updatedCoinHoldings.map(coin => coin.crypto_name);
       
      const portfolioPercentages = updatedCoinHoldings.map(
        coin => ((coin.total_quantity * coin.current_price) / totalPortfolioValue) * 100
      );
      const chartDataPoints = portfolioPercentages.map(percentage => parseFloat(percentage.toFixed(2)));
      
      const chartColors =  [ '#FF5733',
      '#66BB6A', 
      '#42A5F5', 
      '#FFC107',
      '#FF4081', 
      '#9C27B0',
      '#FF5722', 
      '#4CAF50',
      '#2196F3', 
      '#FF9800', ]
  
      setChartData({
        labels: chartLabels,
        datasets: [
          {
            data: chartDataPoints,
            backgroundColor: chartColors,
          },
        ],
      });
    }
    catch (error) {
    console.error('Error fetching data:', error);
    }
  }

  const handleShowConfirmationPopup = () => {
    setShowConfirmationPopup(true);
  };
  const handleCancelDeleteCoin = () => {
    setShowConfirmationPopup(false);
  };
  const handleConfirmDeleteCoin = async () => {
    setShowConfirmationPopup(false); 
    await handleDeleteCoin();
  };
  const handleDeleteCoin = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        Authorization: `Bearer ${token}`,
      };
  
      const response = await axios.delete(
        `http://localhost:8000/api/crypto/delete/${selectedCoin.id}`,
        { headers }
      );
  
      console.log('Coin deleted:', response.data);
      closeCoinInfoPopup()
      reloadDash()
    } catch (error) {
      console.error('Error deleting coin:', error);
    }
  };
  /* Delete transaction */
  const handleShowDeleteTxnPopup = () => {
    setShowDeleteTxnPopup(true);
  };
  const handleCancelTxn = () => {
    setShowDeleteTxnPopup(false);
  };
  const handleConfirmDeleteTxn = async () => {
    setShowDeleteTxnPopup(false); 
    await handleDeleteTxn();
   
  };
  const handleDeleteTxn = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        Authorization: `Bearer ${token}`,
      };
  
      const response = await axios.delete(
        `http://localhost:8000/api/transaction/delete/${selectedTransaction.id}`,
        { headers }
      );
  
      console.log('Transaction deleted:', response.data);
      closeTransactionDetailsPopup()
      closeCoinInfoPopup()
      reloadDash()
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };
  const calculateTotalInvestment = (updatedCoinHoldings, totalPortfolioValue) => {
    let totalInvestment = 0;
    
    updatedCoinHoldings.forEach((holding) => {
      const { avgPrice, total_quantity } = holding;
      const investment = avgPrice * total_quantity;
      totalInvestment += investment;
    });
    
    const percentage = ((totalPortfolioValue-totalInvestment)/totalInvestment)*100
    setTotalInvestmentChange(Math.round(totalPortfolioValue-totalInvestment))
    setPerformanceChange(percentage)
  };

  const handleToggleSort = (ascending) => {
    const sortedCoinHoldings = coinHoldings.slice().sort((a, b) => {
      const valueA = a.total_quantity * a.current_price;
      const valueB = b.total_quantity * b.current_price;
      if (ascending) {
        return valueA - valueB; // Ascending order
      } else {
        return valueB - valueA; // Descending order
      }
    });
    setCoinHoldings(sortedCoinHoldings);
    setSortAscending(ascending);
  };
  return (
    
    <div>
      
      <Dashboardheader/>

      <div className="dashboard-container">
      <div className="total-portfolio">
      
        <div className="portfolio-performance">
            <span className="performance-label"> {Math.round(totalPortfolioValue)} USD</span>
            <span className={`profit-loss ${totalInvestmentChange >= 0 ? 'positive' : 'negative'}`}>
              {totalInvestmentChange >= 0 ? 'Total Profit +' : 'Total Loss -'}${Math.abs(totalInvestmentChange)} ({Math.round(performanceChange)}%)
            </span>
        </div>
     </div>
        
      <div className='cryptoSearchContainer'> 
        <CryptoSearch 
          reloadDash = {reloadDash}

        />
      </div>
        <div className="coinHoldingsContainers">
        <div className='coinHoldingsContainer'>
        <div className="coin-holdings">
          <div className="coin-holdings-header">
            <span>Coin</span>
            <span>Price</span>
            <span className='removeMobile'>24H</span>
            <span>Holdings  
            <span>
            <button className='sortBtn'
          onClick={() => handleToggleSort(true)}
          style={{ color: sortAscending ? 'green' : '' }}
        >
          ▲
        </button>
        <button className='sortBtn'
          onClick={() => handleToggleSort(false)}
          style={{ color: sortAscending ? '' : 'green' }}
        >
          ▼
        </button>
        </span>
            </span>
          </div>
          
        {coinHoldings.map((coin, index) => (
          <div className="coin-holdings-row" key={index} onClick={() => handleRowClick(coin)}>            
            <div className="coin-name">
              <img src={coin.crypto_logo} alt={coin.crypto_name} className="coin-logo" />
              <div className="coin-details">
                <p>{coin.crypto_name}</p>
              </div>
            </div>  
            <span> ${coin.current_price} USD</span>
            <span className='removeMobile' style={{ color: coin.price_change_percentage_24h < 0 ? 'red' : 'green' }}>
              {coin.price_change_percentage_24h.toFixed(2)}%
            </span>
            <div className="holdings-column">
                <div className="holdings-price">
                  {Math.round(coin.total_quantity * coin.current_price)} USD
                </div>
                <div className="holdings-quantity">
                {coin.total_quantity} {coin.crypto_name} 
                </div>
            </div>
          </div>
        ))}

        {showCoinInfoPopup && (
          <div className="popupCoin">
            <img src={backArrow} onClick={() => closeCoinInfoPopup()} className='closeArrow' /> 
           <h2> <img src={selectedCoin.crypto_logo} alt={selectedCoin.crypto_name} className="coin-logo" /> {selectedCoin.crypto_name} <span className='coinSymbol'> ({selectedCoin.coinSymbol})  </span> </h2>
            <div className="details-container">
              <div className="column">
                <p>Holdings Value </p>
                <p className='coinNumber'> ${Math.round(selectedCoin.total_quantity * selectedCoin.current_price)} USD</p>
                <p>Holdings Quantity</p>
                <p className='coinNumber'>{selectedCoin.total_quantity} {selectedCoin.crypto_name}</p>
                <p>Total Cost </p>
                <p className='coinNumber'> ${Math.round(selectedCoin.avgPrice * selectedCoin.total_quantity)} USD</p>
                <p>Profit/Loss:</p>
                <p className='coinNumber'>
                  {Math.round(selectedCoin.total_quantity * selectedCoin.current_price) - Math.round(selectedCoin.total_quantity * selectedCoin.avgPrice)} USD{' '}
                  {selectedCoin.current_price !== selectedCoin.avgPrice ? (
                    <span className={`profit-loss ${selectedCoin.current_price - selectedCoin.avgPrice >= 0 ? 'green' : 'red'}`}>
                      ({isFinite((selectedCoin.current_price - selectedCoin.avgPrice) / selectedCoin.avgPrice) ? (
                        ((selectedCoin.current_price - selectedCoin.avgPrice) / selectedCoin.avgPrice * 100).toFixed(2) <= 1000000000 ? (
                          ((selectedCoin.current_price - selectedCoin.avgPrice) / selectedCoin.avgPrice * 100).toFixed(2) + '%'
                        ) : '> 1,000,000,000%'
                      ) : ''})
                    </span>
                  ) : ''}
                </p>
              </div>
              <div className="column">
                <p>Holdings</p>
                <p className='coinNumber'>{selectedCoin.total_quantity} {selectedCoin.crypto_name}</p>
                <p>Average Net Cost</p>
                <p className='coinNumber'> ${selectedCoin.avgPrice.toFixed(2)} USD</p>
              </div>
            </div>
            
            <div className="transaction-history">
              <h3>Transaction History</h3>
              {selectedCoin.transaction_history.map((transaction, index) => (
                <div className="transaction-row" key={index} onClick={() => handleTransactionRowClick(transaction)}>
                  <div> 
                  <div className={`transaction-label ${transaction.transaction_type}`}>
                      {transaction.transaction_type === 'buy' ? 'Buy' : 'Sell'}
                    </div>
                    <div className="transaction-date">
                      {new Date(transaction.transaction_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                  
                  <div> 
                    <div className="transaction-amount">
                      {transaction.quantity} {selectedCoin.crypto_name}
                    </div>
                    <div className="transaction-paid">
                      {transaction.transaction_type === 'buy' ? 'Paid' : 'Received'}: {transaction.total_amount} USD
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {showTransactionDetailsPopup && (
              <div className="transaction-details-popup">
                <div className="popup-content">
                  <div className="popup-header">
                    <h3>Transaction Details</h3>
                   
                  </div>
                  <div className="popup-columns">
                    <div className="column">
                      <p>Type</p>
                      <p className='coinSymbol'> <strong>{selectedTransaction.transaction_type}  </strong></p>
                      <p>Price per Coin</p>
                      <p className='specificTxnInfo'>${selectedTransaction.price_per_unit} USD</p>

                    </div>
    
                    <div className="column">
                      <p>Date</p>
                      <p className='specificTxnInfo'>
                        {new Date(selectedTransaction.transaction_date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                      <p>Quantity</p>
                      <p className='specificTxnInfo'>{selectedTransaction.quantity} {selectedCoin.crypto_name}</p>
                      <p>Total Cost</p>
                      <p className='specificTxnInfo'>${selectedTransaction.total_amount} USD</p>
                    </div>
                   
                  </div>
                  <div className="popup-buttons">
                    <button className='deleteTxnBtn' onClick={handleShowDeleteTxnPopup}>Delete</button>
                    <button className='editTxnBtn'onClick={openEditTransactionForm}>Edit</button>
                    <button onClick={closeTransactionDetailsPopup}>Close</button>
                  </div>
                  {showDeleteTxn && (
                    <div className="confirmation-popup">
                      <p>Are you sure you want to delete this transaction?</p>
                      <div> 
                        <button onClick={handleConfirmDeleteTxn}>Yes</button>
                        <button onClick={handleCancelTxn}>No</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
             
         <div className="popup-buttons-container">
          <div className="popup-buttons-row">
            <div className="addtxnCoinPopup">
              <button onClick={openAddTransactionPopup}  className="closePopupBtn"> Add Transaction</button>
            </div>
            <div className="removeCoinFromPortfolio">
              <button onClick={handleShowConfirmationPopup}>Delete Coin</button>
            </div>
            {showConfirmationPopup && (
              <div className="confirmation-popup">
                <p>Are you sure you want to delete this coin?</p>
                <div> 
                <button className= "yesDeleteBtn" onClick={handleConfirmDeleteCoin}>Yes</button>
                <button className= "noDeleteBtn" onClick={handleCancelDeleteCoin}>No</button>
                </div>
              </div>
            )}
          </div>
          <div className="addtxnCoinPopup">
            <button onClick={() => closeCoinInfoPopup()} className="closePopupBtn">Close</button>
          </div>
        </div>
          </div>
        )}
            {showAddTransactionPopup && (
              <AddTransactionPopup
                coin={selectedCoin}
                onClose={closeAddTransactionPopup}
                reloadDash = {reloadDash}
              />
            )}
            {showEditTransactionPopup && (
              <EditTransactionPopup
                transaction={selectedTransaction}
                coin={selectedCoin}
                onClose={closeEditTransactionPopup}
                onClosePrevious={closeTransactionDetailsPopup}
                reloadDash = {reloadDash}
                closeCoinInfoPopup = {closeCoinInfoPopup}
              />
            )}
      </div> 
      </div>

      <div className='charts'> 
      <div className='lineContainer' style={{ padding:'20px',  width:'75%', }}>
         <LineGraph  totalPortfolioValue ={totalPortfolioValue} 
         coinHoldings = {coinHoldings} 
         selectedCoin={selectedCoin}
         />
          
        </div>
      <div style={{ padding:'20px',  width:'20%', }} className='pieContainer'>
          <div className='pieTitle'> </div>
          <Pie data={chartData} options={options}>    </Pie> 
        </div> 
      </div>
      </div>
      
      
      </div>

      <footer className="footer">
                <p>&copy; {new Date().getFullYear()} Credits to CoinGecko for API access. CoinCanvas. All rights reserved. </p>
            </footer>
    </div>
  );
}

export default Dashboard;