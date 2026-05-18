require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const productRoutes = require('./routes/productRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

const PORT = process.env.PORT || 5050;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tech_store';
const MONGO_REQUIRED = String(process.env.MONGO_REQUIRED || 'false').toLowerCase() === 'true';

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || origin === CLIENT_URL || origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }

      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '5mb' }));
app.use(morgan('dev'));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Tech Store backend API is running successfully.',
    dataProvider: 'DummyJSON API',
    routes: {
      health: '/api/health',
      productSearch: '/api/products/search?q=iphone&limit=8',
      productDetail: '/api/products/dummyjson_1',
      trending: '/api/products/trending',
      categories: '/api/products/categories',
      aiHealth: '/api/ai/health',
    },
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    service: 'Tech Store Node API',
    version: '2.1.0',
    port: PORT,
    mongoConnected: mongoose.connection.readyState === 1,
    mongoRequired: MONGO_REQUIRED,
    productProvider: 'DummyJSON',
    pythonAiUrl: process.env.PYTHON_AI_URL || 'http://127.0.0.1:8000',
  });
});

app.use('/api/products', productRoutes);
app.use('/api/ai', aiRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found',
    requestedUrl: req.originalUrl,
    availableRoutes: [
      '/api/health',
      '/api/products/search?q=laptop',
      '/api/products/trending',
      '/api/products/categories',
    ],
  });
});

app.use((error, req, res, next) => {
  console.error('API error:', error);

  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    requestedUrl: req.originalUrl,
  });
});

async function connectMongo() {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 4000,
    });

    console.log('MongoDB connected successfully');
  } catch (error) {
    console.warn('MongoDB not connected:', error.message);

    if (MONGO_REQUIRED) {
      throw error;
    }

    console.warn('Continuing without MongoDB because MONGO_REQUIRED=false. Product cache will use memory only.');
  }
}

async function start() {
  try {
    await connectMongo();

    app.listen(PORT, () => {
      console.log(`Tech Store Node API running on http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
      console.log(`DummyJSON search test: http://localhost:${PORT}/api/products/search?q=iphone&limit=8`);
    });
  } catch (error) {
    console.error('Startup failed:', error.message);
    process.exit(1);
  }
}

start();