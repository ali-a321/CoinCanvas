const express = require('express')
const router = express.Router()
const {addTransaction, getTransactions, deleteTransaction, modifyTransaction  } = require("../controllers/transactionController")
const db = require('../db');
const verifyToken  = require("../middleware/userAuth")

//Middleware to attach db object to req object
const attachDb = (req, res, next) => {
    req.db = db;
    next();
  };
router.use(attachDb); 

router.post('/transaction/add', verifyToken, addTransaction)
router.get('/transaction/get/:coinId', verifyToken, getTransactions);
router.delete('/transaction/delete/:id', verifyToken,  deleteTransaction)
router.put('/transaction/modify/:id', verifyToken, modifyTransaction)


module.exports = router