const db = require('../db');
const axios = require('axios');

//POST /api/crypto/add
const addCrypto = async (req, res) => {
    try {
        const { symbol } = req.body;

        // Make API request to Coingecko to fetch cryptocurrency data
        const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${symbol}`);
        const cryptoData = response.data;
        const name = cryptoData.name;

        // Check if the cryptocurrency with the same name already exists for the user
        const checkQuery = 'SELECT * FROM crypto WHERE user_id = ? AND crypto_name = ?';
        db.query(checkQuery, [req.id, name], (checkError, checkResults) => {
            if (checkError) {
                console.error('Error checking cryptocurrency:', checkError);
                return res.status(500).json({ message: 'Failed to add cryptocurrency' });
            }

            if (checkResults.length > 0) {
                return res.status(400).json({ message: 'Cryptocurrency already exists for the user' });
            }

            // Save the cryptocurrency data to the database
            const logoUrl = cryptoData.image.small;
            const insertQuery = 'INSERT INTO crypto (user_id, crypto_name, crypto_logo) VALUES (?, ?, ?)';
            db.query(insertQuery, [req.id, name, logoUrl], (insertError, result) => {
                if (insertError) {
                    console.error('Error adding crypto:', insertError);
                    return res.status(500).json({ message: 'Failed to add cryptocurrency' });
                }

                return res.status(201).json({ message: 'Cryptocurrency added successfully' });
            });
        });
    } catch (error) {
        console.error('Error adding crypto:', error);
        res.status(500).json({ message: 'Failed to add cryptocurrency' });
    }
};

//GET /api/crypto/get
const getCrypto = async (req, res) => {
    try {
        const query = 'SELECT * FROM crypto WHERE user_id = ?';
        db.query(query, [req.id], (error, results) => {
            if (error) {
                console.error('Error fetching cryptocurrency data:', error);
                return res.status(500).json({ message: 'Failed to fetch cryptocurrency data' });
            }

            return res.status(200).json(results);
        });
    } catch (error) {
        console.error('Error fetching cryptocurrency data:', error);
        res.status(500).json({ message: 'Failed to fetch cryptocurrency data' });
    }
};

//DELETE /api/crypto/delete/:id
const deleteCrypto = async (req, res) => {
    try {
      const { id } = req.params; // pass the cryptocurrency's ID as parameter
  
      const selectQuery = 'SELECT user_id FROM crypto WHERE id = ?';
      db.query(selectQuery, [id], (selectError, selectResults) => {
        if (selectError) {
          console.error('Error selecting cryptocurrency:', selectError);
          return res.status(500).json({ message: 'Failed to delete cryptocurrency' });
        }
  
        if (selectResults.length === 0) {
          return res.status(404).json({ message: 'Cryptocurrency not found' });
        }
  
        const cryptoUserId = selectResults[0].user_id;
  
        // Check if the authenticated user is deleting his own or somebody else.
        if (cryptoUserId !== req.id) {
          return res.status(403).json({ message: 'You are not authorized to delete this cryptocurrency' });
        }
  
        db.beginTransaction(async (transactionError) => {
          if (transactionError) {
            console.error('Error starting transaction:', transactionError);
            return res.status(500).json({ message: 'Failed to delete cryptocurrency' });
          }
  
          try {
            const deleteTransactionsQuery = 'DELETE FROM transactions WHERE crypto_id = ?';
            await db.query(deleteTransactionsQuery, [id]);
  
            const deleteCryptoQuery = 'DELETE FROM crypto WHERE id = ?';
            const deleteResult = await db.query(deleteCryptoQuery, [id]);
  
            if (deleteResult.affectedRows === 0) {
              await db.rollback();
              return res.status(404).json({ message: 'Cryptocurrency not found' });
            }
  
            db.commit();
            return res.status(200).json({ message: 'Cryptocurrency and associated transactions deleted successfully' });
          } catch (deleteError) {
            await db.rollback();
            console.error('Error deleting cryptocurrency:', deleteError);
            return res.status(500).json({ message: 'Failed to delete cryptocurrency' });
          }
        });
      });
    } catch (error) {
      console.error('Error deleting cryptocurrency:', error);
      res.status(500).json({ message: 'Failed to delete cryptocurrency' });
    }
  };


module.exports = { addCrypto, getCrypto, deleteCrypto };