// 📁 server/server.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectMongo = require('./config/connectMongo');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Allowed origins (update as needed)
const allowedOrigins = [
  'http://localhost:3000',                           // React dev server
  'http://localhost:5173',                           // Vite dev server
  'https://neptune.hamendotechnologies.com',         // frontend production
  'https://neptune-backend.hamendotechnologies.com', // backend API endpoint
  'https://hamendotechnologies.com'                  // company website (optional)
];

// 🧩 Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g., curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error(`❌ Blocked by CORS: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
);

// ✅ Handle preflight requests
app.options('*', cors());

// Parse JSON bodies
app.use(express.json());

// 🔌 Connect to MongoDB
connectMongo().then(() => {
  console.log('✅ Connected DB:', mongoose.connection.name);
  console.log('📂 Collections:', Object.keys(mongoose.connection.collections));
});

// 🛣️ API Routes
app.use('/api/admin/master', require('./routes/adminMasterRoute'));
app.use('/api/webhook', require('./routes/webhookRoute'));
app.use('/api/performance', require('./routes/performanceRoute'));
app.use('/api/upload-performance', require('./routes/uploadPerformanceRoute'));
app.use('/api/employee', require('./routes/employeeRoute'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/performance-export', require('./routes/performanceExport'));

// 🌐 Root Endpoint
app.get('/', (req, res) => {
  res.send('🌐 Employee Performance Server Running');
});

// 🚀 Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
