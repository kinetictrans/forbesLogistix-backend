const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pdfRoutes = require('./routes/pdfRoutes');
const auth = {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }


dotenv.config();
const app = express();
app.use(cors());
app.use(cors({
    origin: 'https://forbes-logistics-backend-9i9g-8i60yom1j.vercel.app',
    methods: ['GET', 'POST'],
  }));

//app.options('/api/send-pdf', cors());
// ✅ CORS configuration — allow frontend origin



// Body parser
app.use(express.json({ limit: '10mb' }));
//app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', pdfRoutes);

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));