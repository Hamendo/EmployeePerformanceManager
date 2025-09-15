// server/routes/performanceRoute.js
const express = require('express');
const router = express.Router();
const Performance = require('../models/Performance');

// --- Helper: Flatten record strictly ----
function flattenRecord(doc, { department, empId }) {
  const base = {
    employeeId: doc.employeeId,
    department: doc.department,
    date: doc.date,
    location: doc.location,
  };

  // Case 1: If searching by department or empId → show ONLY that dept’s section
  if (department || empId) {
    const deptKey = doc.department.toLowerCase().replace(/\s+/g, '');
    const section = doc[deptKey];
    if (section && typeof section === 'object') {
      return { ...base, ...section };
    }
    return base; // fallback if section not found
  }

  // Case 2: If no department/empId → show only meta
  return base;
}

// --- GET Route ---
router.get('/', async (req, res) => {
  try {
    const { empId, department, month, page = 1, limit = 20, viewAll } = req.query;

    const isViewAll =
      String(limit).toLowerCase() === 'all' || String(viewAll).toLowerCase() === 'true';
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = isViewAll ? null : Math.max(1, parseInt(limit, 10) || 100);

    const filter = {};
    if (empId) filter.employeeId = empId;
    if (department) filter.department = { $regex: new RegExp(`^${department}$`, 'i') };

    // Month filter
    if (month) {
      let monthNum, yearNum;
      if (/^\d{4}-\d{2}$/.test(month)) {
        yearNum = month.slice(0, 4);
        monthNum = month.slice(5, 7);
      } else if (/^\d{1,2}\/\d{4}$/.test(month)) {
        [monthNum, yearNum] = month.split('/');
        monthNum = monthNum.padStart(2, '0');
      }
      if (monthNum && yearNum) {
        const regex = new RegExp(`\\d{1,2}\\/${monthNum}\\/${yearNum}$`);
        filter.date = { $regex: regex };
      }
    }

    // Query with pagination
    let docs, total;
    if (isViewAll) {
      docs = await Performance.find(filter).sort({ date: -1 }).lean();
      total = docs.length;
    } else {
      docs = await Performance.find(filter)
        .sort({ date: -1 })
        .skip((pageNum - 1) * pageSize)
        .limit(pageSize)
        .lean();
      total = await Performance.countDocuments(filter);
    }

    const formatted = docs.map(d => flattenRecord(d, { department, empId }));

    res.json({
      data: formatted,
      total,
      page: pageNum,
      totalPages: isViewAll ? 1 : Math.ceil(total / pageSize),
    });
  } catch (err) {
    console.error('Error fetching performance data:', err);
    res.status(500).json({ message: 'Error fetching performance data' });
  }
});

module.exports = router;
