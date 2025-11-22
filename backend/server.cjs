require('dotenv').config();
const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/productRoutes.cjs');
const locationRoutes = require('./routes/locationRoutes.cjs');
const dashboardRoutes = require('./routes/dashboardRoutes.cjs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes (mounted at root to match frontend expectations)
app.use('/products', productRoutes);
app.use('/locations', locationRoutes);
app.use('/dashboard', dashboardRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Haniya API is running' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Haniya API running on port ${PORT}`);
});
