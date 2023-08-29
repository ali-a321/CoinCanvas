const db = require('../db');

// POST /api/transaction/add
const addTransaction = async (req, res) => {
  try {
    const userId = req.id; // Assuming req.id contains the authenticated user's ID
    const {
      crypto_id,
      transaction_type,
      transaction_date,
      quantity,
      price_per_unit,
      total_amount,
    } = req.body;

    const query = `
      INSERT INTO transactions (user_id, crypto_id, transaction_type, transaction_date, quantity, price_per_unit, total_amount)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      query,
      [userId, crypto_id, transaction_type, transaction_date, quantity, price_per_unit, total_amount],
      (error, result) => {
        if (error) {
          console.error('Error adding transaction:', error);
          return res.status(500).json({ message: 'Failed to add transaction' });
        }

        return res.status(201).json({ message: 'Transaction added successfully' });
      }
    );
  } catch (error) {
    console.error('Error adding transaction:', error);
    res.status(500).json({ message: 'Failed to add transaction' });
  }
};

//Get all the transcactions for a specific crypto for the user
// GET /api/transaction/get/:coinId
const getTransactions = async (req, res) => {
  try {
    const userId = req.id; // user's ID
    const { coinId } = req.params; // Assuming you pass the coin ID as a URL parameter

    const query = `
      SELECT * FROM transactions
      WHERE user_id = ? AND crypto_id = ?
      ORDER BY transaction_date DESC
    `;

    db.query(query, [userId, coinId], (error, results) => {
      if (error) {
        console.error('Error fetching transactions:', error);
        return res.status(500).json({ message: 'Failed to fetch transactions' });
      }

      return res.status(200).json(results);
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
};

// DELETE /api/transaction/delete/:id
const deleteTransaction = async (req, res) => {
  try {
    const transactionId = req.params.id;

    const query = `
      DELETE FROM transactions
      WHERE id = ?
    `;

    db.query(query, [transactionId], (error, result) => {
      if (error) {
        console.error('Error deleting transaction:', error);
        return res.status(500).json({ message: 'Failed to delete transaction' });
      }

      return res.status(200).json({ message: 'Transaction deleted successfully' });
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ message: 'Failed to delete transaction' });
  }
};

// PUT /api/transaction/modify/:id
const modifyTransaction = async (req, res) => {
  try {
    const transactionId = req.params.id;
   
    const {
      crypto_id,
      transaction_type,
      transaction_date,
      quantity,
      price_per_unit,
      total_amount,
    } = req.body;

    const isoDate = new Date(transaction_date);
    const mysqlFormattedDate = isoDate.toISOString().slice(0, 19).replace('T', ' ');
    console.log('Input transaction_date:', transaction_date);
    console.log('isoDate:', isoDate);
    console.log('mysqlFormattedDate:', mysqlFormattedDate);
    const query = `
      UPDATE transactions
      SET crypto_id = ?, transaction_type = ?, transaction_date = ?, quantity = ?, price_per_unit = ?, total_amount = ?
      WHERE id = ?
    `;

    db.query(
      query,
      [crypto_id, transaction_type, mysqlFormattedDate, quantity, price_per_unit, total_amount, transactionId],
      (error, result) => {
        if (error) {
          console.error('Error modifying transaction:', error);
          return res.status(500).json({ message: 'Failed to modify transaction' });
        }

        return res.status(200).json({ message: 'Transaction modified successfully' });
      }
    );
  } catch (error) {
    console.error('Error modifying transaction:', error);
    res.status(500).json({ message: 'Failed to modify transaction' });
  }
};

module.exports = { addTransaction, getTransactions, deleteTransaction, modifyTransaction };
