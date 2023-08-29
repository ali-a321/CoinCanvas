import React from 'react'
import axios from 'axios';
import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js'
ChartJS.register(
    LineElement, CategoryScale, LinearScale, PointElement
)

function LineGraph( {totalPortfolioValue, coinHoldings, selectedCoin}) {
    const [historicalData, setHistoricalData] = useState([]);
    const [activeInterval, setActiveInterval] = useState('Y')
    const [chartData, setChartData] = useState({labels: [],
      datasets: [
        {
          label: 'Portfolio',
          data: [], 
          fill: false,
          borderColor: 'rgba(0, 123, 255, 1)', 
          backgroundColor: 'rgba(0, 123, 255, 0.2)', 
          pointBorderColor: 'rgba(0, 123, 255, 1)', 
          pointBackgroundColor: 'white', 
          pointBorderWidth: 2,
          pointRadius: 0.5,
          cubicInterpolationMode: 'monotone'
        },
      ],
    })
    
    const options = {
      responsive: true, 
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
          position: 'top', 
          labels: {
            font: {
              size: 14,
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false, 
          },
          ticks: {
            font: {
              size: 12,
            },
            maxTicksLimit: 10, 
          },
        },
        y: {
          ticks: {
            font: {
              size: 12,
            },
          },
        },
        
      },
      
    };       
    
    const convertUnix = (unixTimestamp) => {
        const date = new Date(unixTimestamp);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); 
        const day = String(date.getDate()).padStart(2, '0');
        
        const formattedDate = `${year}-${month}-${day}`;
        return formattedDate
    }
    const convertISO = (isoDateString) => {
        const date = new Date(isoDateString);
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        return formattedDate
    }
   
    useEffect(() => {
    
      fetchHistoricalData();
    }, [coinHoldings]);

    const fetchHistoricalData = async () => {
      try {
        const vsCurrency = 'usd';
        const days = 364
        const dateToTotalValuePromises = coinHoldings.map(async (holding) => {
          const cryptoName  = holding.crypto_name;
          const formattedCryptoName = cryptoName.toLowerCase().replace(/\s+/g, '-'); // Replace spaces with hyphens
          const response = await axios.get(
            `https://api.coingecko.com/api/v3/coins/${formattedCryptoName}/market_chart`,
            {
              params: {
                vs_currency: vsCurrency,
                days: days,
              },
            }
          );
  
          const historicalPrices = response.data.prices.map((dataPoint) => ({
            date: convertUnix(dataPoint[0]),
            price: dataPoint[1],
          }));
  
          const dateToTotalValue = [];
          let totalQuantity = 0;
          const { transaction_history } = holding;
          
          totalQuantity += txnsBeforeLastYear(transaction_history)
          historicalPrices.forEach(({ date, price }) => {
            transaction_history.forEach((transaction) => {
              const transactionDate = convertISO(transaction.transaction_date);
              if (transactionDate === date) {
                if (transaction.transaction_type === 'buy') {
                  totalQuantity += transaction.quantity;
                } else if (transaction.transaction_type === 'sell') {
                  totalQuantity -= transaction.quantity;
                }
              }
            });
  
            const totalValue = totalQuantity * price;
            dateToTotalValue.push({ date, totalValue, totalQuantity });
          });
  
          return dateToTotalValue;
        });
  
        const dateToTotalValueArray = await Promise.all(dateToTotalValuePromises);
        const combinedDateToTotalValue = combineDateToTotalValue(dateToTotalValueArray);
  
        setHistoricalData(combinedDateToTotalValue);
        makeLineGraph(combinedDateToTotalValue);
      } catch (error) {
        console.error('Error fetching historical data:', error);
      }
    };  
      const combineDateToTotalValue = (dateToTotalValueArray) => {
        const combinedData = {};

        dateToTotalValueArray.forEach((dateToTotalValue) => {
          dateToTotalValue.forEach(({ date, totalValue, totalQuantity }) => {
            if (!combinedData[date]) {
              combinedData[date] = { totalValue: 0, totalQuantity: 0 };
            }
      
            combinedData[date].totalValue += totalValue;
            combinedData[date].totalQuantity += totalQuantity;
          });
        });
      
        const combinedDateToTotalValue = Object.keys(combinedData).map((date) => ({
          date,
          totalValue: combinedData[date].totalValue,
          totalQuantity: combinedData[date].totalQuantity,
        }));
  
        return combinedDateToTotalValue;
    }
    
    const txnsBeforeLastYear = (transaction_history) => {
      let totalQuantityBeforeYear = 0;
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      transaction_history.forEach((transaction) => {
        const transactionDate = new Date(transaction.transaction_date);
        if (transactionDate < oneYearAgo) {
          if (transaction.transaction_type === 'buy') {
            totalQuantityBeforeYear += transaction.quantity;
          } else if (transaction.transaction_type === 'sell') {
            totalQuantityBeforeYear -= transaction.quantity;
          }
        }
      });
      return totalQuantityBeforeYear
    }
    const makeLineGraph = (lineInfo, lengthz) => {
   
        const chartLabel = lineInfo.map(data => data.date)
        const chartTotal =  lineInfo.map(data => data.totalValue)
        const last7Indices = chartLabel.length - 7;
        const lastMonth = chartLabel.length - 30;
        const weeklyChartTotal = chartTotal.slice(last7Indices);
        const weeklyChartLabel = chartLabel.slice(last7Indices);
        const monthlyChartTotal = chartTotal.slice(lastMonth);
        const monthlyChartLabel = chartLabel.slice(lastMonth);
        const roundToInteger = (array) => array.map(value => Math.round(value));
        if (lengthz === "M" ){
          const chartData = {
            labels: monthlyChartLabel,
            datasets: [
                {
                label: 'Portfolio',
                data: roundToInteger(monthlyChartTotal),
                fill: false,
                borderColor: 'blue',
                },
            ],
            };
            setChartData(chartData);  
        } else if (lengthz === "W"){
            const chartData = {
              labels: weeklyChartLabel,
              datasets: [
                  {
                  label: 'Portfolio',
                  data: roundToInteger(weeklyChartTotal),
                  fill: false,
                  borderColor: 'blue',
                  },
              ],
              };
              setChartData(chartData);  
        } else {
            const chartData = {
              labels: chartLabel,
              datasets: [
                  {
                  label: 'Portfolio',
                  data: roundToInteger(chartTotal),
                  fill: false,
                  borderColor: 'blue',
                  },
              ],
              };
              setChartData(chartData);  

        }
        
    }

  
   
    return (
      <div>
        <div className="chart-container">
          <Line data={chartData} options={options}></Line>
          <div className="chart-btns">
            <button
              className={`interval-btn ${activeInterval === 'Y' ? 'active' : ''}`}
              onClick={() => {
                setActiveInterval('Y');
                makeLineGraph(historicalData, "Y");
              }}
            >
              Y
            </button>
            <button
              className={`interval-btn ${activeInterval === 'M' ? 'active' : ''}`}
              onClick={() => {
                setActiveInterval('M');
                makeLineGraph(historicalData, 'M');
              }}
            >
              M
            </button>
            <button
              className={`interval-btn ${activeInterval === 'W' ? 'active' : ''}`}
              onClick={() => {
                setActiveInterval('W');
                makeLineGraph(historicalData, "W");
                
              }}
            >
              W
            </button>
          </div>
        </div>
      </div>
    );
}

export default LineGraph