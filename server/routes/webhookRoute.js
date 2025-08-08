const express = require('express');
const router = express.Router();
const Performance = require('../models/Performance');

// POST /api/webhook
router.post('/', async (req, res) => {
  try {
    const rows = req.body.rows;

    if (!Array.isArray(rows)) {
      return res.status(400).json({ message: 'Invalid payload' });
    }

    for (const row of rows) {
      const { empId, name, department, date, ...metrics } = row;

      if (!empId || !date) {
        // skip invalid rows without required keys
        continue;
      }

      await Performance.findOneAndUpdate(
        { empId, date },
        { name, department, metrics },
        { upsert: true, new: true }
      );
    }

    res.status(200).json({ message: 'Performance data synced successfully' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
