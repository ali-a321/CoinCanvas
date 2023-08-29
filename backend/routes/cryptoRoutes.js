const express = require('express')
const router = express.Router()
const {addCrypto, getCrypto, deleteCrypto } = require("../controllers/cryptoController")
const db = require('../db');
const verifyToken  = require("../middleware/userAuth")

//Middleware to attach db object to req object
const attachDb = (req, res, next) => {
    req.db = db;
    next();
  };
router.use(attachDb); 

router.post('/crypto/add', verifyToken, addCrypto)
router.get('/crypto/get', verifyToken, getCrypto);
router.delete('/crypto/delete/:id',verifyToken,  deleteCrypto)

module.exports = router