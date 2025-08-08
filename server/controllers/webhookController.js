// server/controllers/webhookController.js

const Performance = require('../models/Performance');

/**
 * Handles webhook POST requests to sync performance data from Google Sheets.
 * Expects payload: { rows: [ { empId, name, department, date, ...metrics } ] }
 */
exports.syncPerformanceData = async (req, res) => {
  try {
    const rows = req.body.rows;

    if (!Array.isArray(rows)) {
      return res.status(400).json({ message: 'Invalid payload: rows should be an array' });
    }

    for (const row of rows) {
      const { empId, name, department, date, ...metrics } = row;

      if (!empId || !date) {
        // skip invalid rows missing required keys
        continue;
      }

      await Performance.findOneAndUpdate(
        { empId, date },
        { name, department, metrics },
        { upsert: true, new: true }
      );
    }

    return res.status(200).json({ message: 'Performance data synced successfully' });
  } catch (error) {
    console.error('Webhook sync error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
