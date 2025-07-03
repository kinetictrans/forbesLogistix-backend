const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pdfRoutes = require('./routes/pdfRoutes');

dotenv.config();
const app = express();

/* ---------- CORS ---------- */
const allowed = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);           // remove empty strings

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowed.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

app.options('*', cors());     // handle pre-flight automatically
/* -------------------------- */

app.use(express.json({ limit: '10mb' }));

/* Routes */
app.use('/api', pdfRoutes);

app.get('/', (_req, res) => {
  res.send('Forbes Logistics Backend is Running ✅');
});

/* Vercel: export the app (don’t call app.listen) */
module.exports = app;