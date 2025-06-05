const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pdfRoutes = require('./routes/pdfRoutes');

dotenv.config();
const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
  }));

app.use(cors({
  origin: 'https://forbes-logistics-frontend.vercel.app', // your frontend domain on vercel
  methods: ['GET', 'POST'],
}));

app.use(express.json({ limit: '10mb' }));


app.use('/api', pdfRoutes);

app.get('/', (req, res) => {
    res.send('Forbes Logistics Backend is Running ✅');
  });

// DO NOT call app.listen() on Vercel
module.exports = app;