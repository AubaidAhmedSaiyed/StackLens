const express = require('express');
const router = express.Router();
const benchmark = require('../metrics/benchmark');

router.get('/history', (req, res) => {
  try {
    const history = benchmark.getHistory();
    res.json(history);
  } catch (err) {
    console.error("Failed to fetch benchmark history:", err);
    res.status(500).json({ error: "Failed to fetch benchmark history" });
  }
});

module.exports = router;
