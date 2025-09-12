const pool = require('../models/database');

// Get all jobs for logged-in user
const getAllJobs = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM jobs WHERE user_id = $1',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// Get a job by ID
const getJobById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM jobs WHERE id = $1 AND user_id = $2', 
      [id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// Add a new job for the logged-in user
const createJob = async (req, res) => {
  const { title, company, link, status, date_applied, notes, tags } = req.body;

  // Basic validation
  if (!title || !company) {
    return res.status(400).json({ error: 'Title and company are required' });
  }

  // Convert empty strings to null for date fields since Postgres does not accept empty strings for date fields (hence it becomes null)
  const cleanDateApplied = date_applied && date_applied.trim() !== '' ? date_applied : null;

  try {
    const result = await pool.query(
      `INSERT INTO jobs 
        (user_id, title, company, link, status, date_applied, notes, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        req.user.id,
        title,
        company,
        link,
        status || 'applied',
        cleanDateApplied,
        notes,
        tags || [],
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error inserting job:', err);
    res.status(500).send('Server error');
  }
};

// Update a job for the logged-in user
const updateJob = async (req, res) => {
  const { id } = req.params;
  const { title, company, link, status, date_applied, notes, tags } = req.body;

  // Basic validation
  if (!title || !company) {
    return res.status(400).json({ error: 'Title and company are required' });
  }

  // Convert empty strings to null for date fields since Postgres does not accept empty strings for date fields (hence it becomes null)
  const cleanDateApplied = date_applied && date_applied.trim() !== '' ? date_applied : null;

  try {
    const result = await pool.query(
      `UPDATE jobs SET 
        title = $1,
        company = $2,
        link = $3,
        status = $4,
        date_applied = $5,
        notes = $6,
        tags = $7

        WHERE id = $8 AND user_id = $9
        RETURNING *`,
      [title, company, link, status, cleanDateApplied, notes, tags, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating job:', err);
    res.status(500).send('Server error');
  }
};

// Delete a job for the logged-in user
const deleteJob = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM jobs WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.sendStatus(204);
  } catch (err) {
    console.error('Error deleting job:', err);
    res.status(500).send('Server error');
  }
};

module.exports = {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob
};
