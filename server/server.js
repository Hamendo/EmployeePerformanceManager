// 📁 server/server.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectMongo = require('./config/connectMongo');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 🧩 Middleware
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'https://employee-manager-p500.onrender.com'
  ],
  credentials: true
}));
app.use(express.json());

// 🔌 Connect to MongoDB
connectMongo().then(() => {
  console.log('Currently connected DB:', mongoose.connection.name);
  console.log('Collections:', Object.keys(mongoose.connection.collections));
});

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });

// 🛣️ API Routes
app.use('/api/admin/master', require('./routes/adminMasterRoute'));
app.use('/api/webhook', require('./routes/webhookRoute'));
app.use('/api/performance', require('./routes/performanceRoute'));
app.use('/api/upload-performance', require('./routes/uploadPerformanceRoute'));
app.use('/api/employee', require('./routes/employeeRoute'));

// 🌐 Root Endpoint
app.get('/', (req, res) => {
  res.send('🌐 Employee Performance Server Running');
});
