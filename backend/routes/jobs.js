const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob
} = require('../controllers/jobController');

// All job routes require authentication
router.use(verifyToken);

// GET /api/jobs - Get all jobs for logged-in user
router.get('/', getAllJobs);

// GET /api/jobs/:id - Get a job by ID
router.get('/:id', getJobById);

// POST /api/jobs - Add a new job for the logged-in user
router.post('/', createJob);

// PUT /api/jobs/:id - Update a job for the logged-in user
router.put('/:id', updateJob);

// DELETE /api/jobs/:id - Delete a job for the logged-in user
router.delete('/:id', deleteJob);

module.exports = router;
