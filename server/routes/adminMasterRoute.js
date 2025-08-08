const express = require('express');
const axios = require('axios');
const router = express.Router();

const SPREADSHEET_ID = '1syIHQIWvg48i6UECVjRHz6G6F_PXR9avNveCfktZLTM';
const SHEET_NAME = 'Master DB';  // Change if your tab name is different
const OPEN_SHEET_URL = `https://opensheet.elk.sh/${SPREADSHEET_ID}/${SHEET_NAME}`;

// Admin login
router.post('/login', (req, res) => {
  const { password } = req.body;
  console.log('Received password:', password);
  console.log('Expected password:', process.env.ADMIN_PASSWORD);
  
  if (password === process.env.ADMIN_PASSWORD) {
    return res.status(200).json({ message: 'Login successful' });
  }
  return res.status(401).json({ message: 'Invalid password' });
});

// GET /api/admin/master - fetch employee master data
router.get('/', async (req, res) => {
  try {
    const { empId, name, department } = req.query;

    const response = await axios.get(OPEN_SHEET_URL);
    let employees = response.data;

    if (empId) {
      const empIdLower = empId.toLowerCase();
      employees = employees.filter(emp =>
        emp['Employee ID']?.toLowerCase().includes(empIdLower)
      );
    }

    if (name) {
      const nameLower = name.toLowerCase();
      employees = employees.filter(emp =>
        emp['Name']?.toLowerCase().includes(nameLower)
      );
    }

    if (department) {
      const deptLower = department.toLowerCase();
      employees = employees.filter(emp =>
        emp['Department/Team']?.toLowerCase().includes(deptLower)
      );
    }

    employees.sort((a, b) => {
      if (a['Employee ID'] < b['Employee ID']) return -1;
      if (a['Employee ID'] > b['Employee ID']) return 1;
      return 0;
    });

    res.json(employees);
  } catch (error) {
    console.error('Error fetching employee master data:', error.message);
    res.status(500).json({ message: 'Failed to fetch employee master data' });
  }
});

module.exports = router;
