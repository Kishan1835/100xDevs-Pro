const express = require('express');
const { getAllITIs, getITIById } = require('../controllers/iti.controller');

const router = express.Router();

router.get('/', getAllITIs);
router.get('/:id', getITIById);

module.exports = router;
