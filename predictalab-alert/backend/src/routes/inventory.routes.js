const express = require('express');
const { 
  getAllInventory, 
  getAllAuctions 
} = require('../controllers/inventory.controller');

const router = express.Router();

router.get('/', getAllInventory);
router.get('/auctions', getAllAuctions);

module.exports = router;
