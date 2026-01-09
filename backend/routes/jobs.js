const express = require('express');
const router = express.Router();
const db = require('../database-pg');

// GET ALL JOBS
router.get('/', async (req, res) => {
    try {
        const result = await db.query(`
      SELECT 
        jobs.*,
        employers.company_name
      FROM jobs
      JOIN employers ON jobs.employer_id = employers.id
      WHERE jobs.status = 'Active'
      ORDER BY jobs.created_at DESC
    `);

        res.json({ jobs: result.rows });
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET SINGLE JOB
router.get('/:jobId', async (req, res) => {
    const { jobId } = req.params;

    try {
        const result = await db.query(`
      SELECT 
        jobs.*,
        employers.company_name
      FROM jobs
      JOIN employers ON jobs.employer_id = employers.id
      WHERE jobs.id = $1
    `, [jobId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Job not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching job:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST NEW JOB
router.post('/', async (req, res) => {
    const { employerId, title, location, jobType, salary, description, accessibility } = req.body;

    if (!employerId || !title || !location || !jobType || !description || !accessibility) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const result = await db.query(`
      INSERT INTO jobs (employer_id, title, location, job_type, salary, description, accessibility_features)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [employerId, title, location, jobType, salary || '', description, accessibility]);

        res.status(201).json({
            message: 'Job posted successfully!',
            job: result.rows[0]
        });
    } catch (error) {
        console.error('Error posting job:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET EMPLOYER'S JOBS
router.get('/employer/:employerId', async (req, res) => {
    const { employerId } = req.params;

    try {
        const result = await db.query(`
      SELECT 
        jobs.*,
        COUNT(applications.id) as applicant_count
      FROM jobs
      LEFT JOIN applications ON jobs.id = applications.job_id
      WHERE jobs.employer_id = $1
      GROUP BY jobs.id
      ORDER BY jobs.created_at DESC
    `, [employerId]);

        res.json({ jobs: result.rows });
    } catch (error) {
        console.error('Error fetching employer jobs:', error);
        res.status(500).json({ error: error.message });
    }
});

// UPDATE JOB
router.put('/:jobId', async (req, res) => {
    const { jobId } = req.params;
    const { title, location, jobType, salary, description, accessibility, status } = req.body;

    try {
        const result = await db.query(`
      UPDATE jobs
      SET title = $1, location = $2, job_type = $3, salary = $4, 
          description = $5, accessibility_features = $6, status = $7
      WHERE id = $8
      RETURNING *
    `, [title, location, jobType, salary, description, accessibility, status || 'Active', jobId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Job not found' });
        }

        res.json({
            message: 'Job updated successfully!',
            job: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating job:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE JOB
router.delete('/:jobId', async (req, res) => {
    const { jobId } = req.params;

    try {
        const result = await db.query('DELETE FROM jobs WHERE id = $1 RETURNING *', [jobId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Job not found' });
        }

        res.json({ message: 'Job deleted successfully!' });
    } catch (error) {
        console.error('Error deleting job:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;