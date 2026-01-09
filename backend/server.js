// Import required packages
const express = require('express');
const cors = require('cors');
const db = require('./database-pg');

// Import routes
const authRoutes = require('./routes/auth');
const jobsRoutes = require('./routes/jobs');
const applicationsRoutes = require('./routes/applications');
const adminRoutes = require('./routes/admin');

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Inclusive Hiring Platform API!' });
});

// Test database connection route
app.get('/api/test-db', (req, res) => {
    db.all('SELECT name FROM sqlite_master WHERE type="table"', [], (err, tables) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({
            message: 'Database connected successfully!',
            tables: tables
        });
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/admin', adminRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('API endpoints available:');
    console.log('- POST /api/auth/signup');
    console.log('- POST /api/auth/login');
    console.log('- GET /api/jobs');
    console.log('- POST /api/applications');
});