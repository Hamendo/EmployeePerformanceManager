// 📁 server/routes/employeeRoute.js

const express = require('express');
const router = express.Router();
const {
  submitPerformance,
  viewOwnPerformance,
  getEmployeeById,
} = require('../controllers/employeeController');

// 🔐 Employee Login using Employee ID
// router.post('/login', loginEmployee);

// 📝 Submit Daily Performance
router.post('/', submitPerformance);

// 📊 Get Performance Records of the Logged-In Employee
router.get('/performance/:employeeId', viewOwnPerformance);

// 👤 Get Employee Details (used in frontend after login)
router.get('/', getEmployeeById);

module.exports = router;
