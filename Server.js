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

  
  const allowedOrigins = [
    'https://forbes-logistics-frontend.vercel.app',
    'https://forbes-logistics-frontend-git-main-abdulmoominnaiks-projects.vercel.app',
    // add any other frontend URLs you want to allow
  ];
  
  app.use(cors({
    origin: function(origin, callback) {
      // allow requests with no origin like Postman or curl
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
  }));
app.use(express.json({ limit: '10mb' }));


app.use('/api', pdfRoutes);

app.get('/', (req, res) => {
    res.send('Forbes Logistics Backend is Running ✅');
  });

// DO NOT call app.listen() on Vercel
module.exports = app;