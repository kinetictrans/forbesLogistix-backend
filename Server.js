const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const pdfRoutes = require('./routes/pdfRoutes');
const contactRoutes = require('./routes/contactRoutes');
const leadRoutes = require('./routes/leadRoutes');

dotenv.config();

const app = express();

// Vercel sits behind a proxy; trust it so rate limiter sees the real client IP.
app.set('trust proxy', 1);

const allowedOrigins = [
      'https://www.forbeslogistix.com',
      'https://forbeslogistix.com',
      'https://forbes-logistics-frontend.vercel.app',
      'http://localhost:3000',
      'https://forbes-frontend.vercel.app',
    ];

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

// Tighter body size. Contact form payloads are tiny; PDF routes can override per-route if needed.
app.use(express.json({ limit: '100kb' }));

// Rate limit the contact endpoint: 5 requests per IP per 10 minutes.
const contactLimiter = rateLimit({
      windowMs: 10 * 60 * 1000,
      max: 5,
      standardHeaders: true,
      legacyHeaders: false,
      message: { message: 'Too many requests. Please try again later.' },
});
app.use('/api/contact', contactLimiter);

// Tighter rate limit on the Quick Apply lead form (smaller surface, more likely to be hammered).
const leadLimiter = rateLimit({
      windowMs: 10 * 60 * 1000,
      max: 5,
      standardHeaders: true,
      legacyHeaders: false,
      message: { message: 'Too many requests. Please try again later.' },
});
app.use('/api/lead', leadLimiter);

app.use('/api', pdfRoutes);
app.use('/api', contactRoutes);
app.use('/api', leadRoutes);

app.get('/', (req, res) => {
      res.send('Forbes Logistics Backend is Running');
});

module.exports = app;
