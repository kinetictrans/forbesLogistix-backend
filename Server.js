const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pdfRoutes = require('./routes/pdfRoutes');
const contactRoutes = require('./routes/contactRoutes');

dotenv.config();

const app = express();

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

app.use(express.json({ limit: '10mb' }));

console.log('CLIENT_RECEIVER_EMAIL from env:', process.env.CLIENT_RECEIVER_EMAIL);
console.log('CONTACT_RECEIVER_EMAIL from env:', process.env.CONTACT_RECEIVER_EMAIL);

app.use('/api', pdfRoutes);
app.use('/api', contactRoutes);

app.get('/', (req, res) => {
    res.send('Forbes Logistics Backend is Running');
});

module.exports = app;
