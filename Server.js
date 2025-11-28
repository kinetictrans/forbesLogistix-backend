const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pdfRoutes = require('./routes/pdfRoutes');

dotenv.config();
const app = express();

// ✅ ALLOWED ORIGINS
const allowedOrigins = [
  'https://www.forbeslogistix.com',
  'https://forbes-logistics-frontend.vercel.app',
  'http://localhost:3000',
  'https://forbes-frontend.vercel.app',

];

// ✅ CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
  credentials: true,
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
console.log("✅ CLIENT_RECEIVER_EMAIL from env:", process.env.CLIENT_RECEIVER_EMAIL);

// Routes
app.use('/api', pdfRoutes);

// Root
app.get('/', (req, res) => {
  res.send('Forbes Logistics Backend is Running ✅');
});

module.exports = app;