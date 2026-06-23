const express = require('express');
const cors = require('cors');

const analyzeRouter = require('./server/routes/analyze');
const impactRouter = require('./server/routes/impact');
const metricsRouter = require('./server/routes/metrics');

const app = express();
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/analyze', analyzeRouter);
app.use('/api/impact', impactRouter);
app.use('/api/metrics', metricsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`StackLens server running on port ${PORT}`);
});
