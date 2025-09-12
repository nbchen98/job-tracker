const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../models/database');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

// Register a new user
const register = async (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
      [email, hash]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') { // PostgreSQL unique violation
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Login user
const login = async (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
};

module.exports = {
  register,
  login
};
