// server.js (cleaned up with a single CORS middleware)

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pdfRoutes = require('./routes/pdfRoutes');

dotenv.config();
const app = express();

/* -------- CORS configuration -------- */
const allowedOrigins = [
  'https://forbes-logistics-frontend.vercel.app',
  'https://forbes-logistics-frontend-git-main-abdulmoominnaiks-projects.vercel.app',
  'http://localhost:3000',                     // for local testing (optional)
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow server-to-server / curl / Postman requests with no origin
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  })
);

// handle all pre-flight OPTIONS requests
app.options('*', cors());
/* ------------------------------------ */

app.use(express.json({ limit: '10mb' }));

/* Routes */
app.use('/api', pdfRoutes);

app.get('/', (_req, res) => {
  res.send('Forbes Logistics Backend is Running ✅');
});

/* Export for Vercel (do not call app.listen here) */
module.exports = app;