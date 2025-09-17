const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

// Debug: Log environment variables (without sensitive data)
console.log('🔍 Environment check:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET (length: ' + process.env.DATABASE_URL.length + ')' : 'NOT SET');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET (length: ' + process.env.JWT_SECRET.length + ')' : 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV || 'NOT SET');

// Debug: Log connection string format (without password)
if (process.env.DATABASE_URL) {
  const url = process.env.DATABASE_URL;
  const maskedUrl = url.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@');
  console.log('🔍 Connection string format:', maskedUrl);
}

if (missingVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
  console.error('Please create a .env file with the required variables. See .env.example for reference.');
  process.exit(1);
}

// Import the organized routes
const authRoutes = require('./routes/auth');
const jobsRoutes = require('./routes/jobs');
const pool = require('./models/database');


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:5432',
    'https://job-tracker-nghc.onrender.com', // Your Render backend URL
    'https://job-tracker-henna.vercel.app' // Your actual Vercel frontend URL
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// CORS middleware handles preflight requests automatically
app.use(express.json());

// Database connection is now handled in models/database.js

// Add the auth routes - this will prefix all auth routes with /auth
app.use('/auth', authRoutes);
app.use('/api/jobs', jobsRoutes);

app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json(result.rows);
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).send('Database error: ' + err.message);
  }
});

app.get('/test-users-table', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    res.json({ tableExists: result.rows[0].exists });
  } catch (err) {
    console.error('Table check error:', err);
    res.status(500).send('Table check error: ' + err.message);
  }
});

app.get('/test-jobs-table', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'jobs'
      );
    `);
    res.json({ tableExists: result.rows[0].exists });
  } catch (err) {
    console.error('Table check error:', err);
    res.status(500).send('Table check error: ' + err.message);
  }
});

app.get('/test-jobs-structure', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'jobs'
      ORDER BY ordinal_position;
    `);
    res.json({ columns: result.rows });
  } catch (err) {
    console.error('Table structure error:', err);
    res.status(500).send('Table structure error: ' + err.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
