import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import apiRouter from './routes/api.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Mount REST API
app.use('/api', apiRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'Local SEO Optimization & Local Search Intelligence API',
    timestamp: new Date().toISOString(),
  });
});

// Start Express Server
const PORT = parseInt(env.PORT, 10) || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Local SEO Backend Server running on http://localhost:${PORT}`);
  console.log(`📡 Health Check endpoint available at http://localhost:${PORT}/health`);
});
