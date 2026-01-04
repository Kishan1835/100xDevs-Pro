const express = require('express');
const { getAllStudents, getStudentsByITI } = require('../controllers/students.controller');

const router = express.Router();

router.get('/', getAllStudents);
router.get('/iti/:itiId', getStudentsByITI);

module.exports = router;
