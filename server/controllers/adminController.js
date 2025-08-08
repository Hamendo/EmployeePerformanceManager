// 🧠 Admin Controller – Handles admin auth and data access

const dotenv = require('dotenv');
dotenv.config();

const Performance = require('../models/Performance');

// ✅ Admin Login (superpassword check)
const loginAdmin = (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    return res.status(200).json({ success: true, message: 'Admin authenticated' });
  } else {
    return res.status(401).json({ success: false, message: 'Invalid password' });
  }
};

// ✅ Get All Employee Data (placeholder, to be connected to Google Sheet clone)
const getAllEmployees = async (req, res) => {
  try {
    // You’ll replace this with actual DB pull (from cloned sheet)
    const employees = await global.mongo_employees.find().toArray(); // temporary global reference
    res.status(200).json({ success: true, data: employees });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch employee data', error: err.message });
  }
};

// ✅ Get All Performance Records (with optional filters)
const getAllPerformance = async (req, res) => {
  try {
    const filters = {};
    const { employeeId, department, date } = req.query;

    if (employeeId) filters.employeeId = employeeId;
    if (department) filters.department = department;
    if (date) filters.date = date;

    const performanceRecords = await Performance.find(filters).sort({ date: -1 });
    res.status(200).json({ success: true, data: performanceRecords });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch performance data', error: err.message });
  }
};

module.exports = {
  loginAdmin,
  getAllEmployees,
  getAllPerformance,
};
