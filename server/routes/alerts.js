// server/routes/alerts.js
const express = require("express");
const router = express.Router();

// For demo, store alerts in memory (better: save in DB)
let alerts = [];

// ✅ Receive alert from Apps Script
router.post("/", (req, res) => {
  const { event, empId, timestamp, details } = req.body;

  if (!event || !empId) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const alert = { event, empId, timestamp, details, createdAt: new Date() };
  alerts.push(alert);

  console.log("📩 New Alert Received:", alert);
  res.json({ success: true, alert });
});

// ✅ Get all alerts
router.get("/", (req, res) => {
  res.json(alerts);
});

module.exports = router;
