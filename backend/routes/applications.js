const express = require('express');
const router = express.Router();
const db = require('../database-pg');

// SUBMIT APPLICATION
router.post('/', async (req, res) => {
    const { jobSeekerId, jobId } = req.body;

    if (!jobSeekerId || !jobId) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Check if already applied
        const checkResult = await db.query(
            'SELECT * FROM applications WHERE job_seeker_id = $1 AND job_id = $2',
            [jobSeekerId, jobId]
        );

        if (checkResult.rows.length > 0) {
            return res.status(400).json({ error: 'You have already applied to this job' });
        }

        // Insert application
        const result = await db.query(
            'INSERT INTO applications (job_seeker_id, job_id) VALUES ($1, $2) RETURNING *',
            [jobSeekerId, jobId]
        );

        res.status(201).json({
            message: 'Application submitted successfully!',
            application: result.rows[0]
        });
    } catch (error) {
        console.error('Error submitting application:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET JOB SEEKER'S APPLICATIONS
router.get('/job-seeker/:jobSeekerId', async (req, res) => {
    const { jobSeekerId } = req.params;

    try {
        const result = await db.query(`
      SELECT 
        applications.*,
        jobs.title as job_title,
        jobs.location,
        jobs.salary,
        employers.company_name
      FROM applications
      JOIN jobs ON applications.job_id = jobs.id
      JOIN employers ON jobs.employer_id = employers.id
      WHERE applications.job_seeker_id = $1
      ORDER BY applications.applied_at DESC
    `, [jobSeekerId]);

        res.json({ applications: result.rows });
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET APPLICATIONS FOR A JOB
router.get('/job/:jobId', async (req, res) => {
    const { jobId } = req.params;

    try {
        const result = await db.query(`
      SELECT 
        applications.*,
        job_seekers.full_name,
        job_seekers.phone,
        job_seekers.skills,
        job_seekers.disability_info,
        users.email
      FROM applications
      JOIN job_seekers ON applications.job_seeker_id = job_seekers.id
      JOIN users ON job_seekers.user_id = users.id
      WHERE applications.job_id = $1
      ORDER BY applications.applied_at DESC
    `, [jobId]);

        res.json({ applications: result.rows });
    } catch (error) {
        console.error('Error fetching job applications:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET EMPLOYER'S APPLICATIONS
router.get('/employer/:employerId', async (req, res) => {
    const { employerId } = req.params;

    try {
        const result = await db.query(`
      SELECT 
        applications.*,
        jobs.title as job_title,
        job_seekers.full_name,
        job_seekers.phone,
        job_seekers.skills,
        job_seekers.disability_info,
        users.email
      FROM applications
      JOIN jobs ON applications.job_id = jobs.id
      JOIN job_seekers ON applications.job_seeker_id = job_seekers.id
      JOIN users ON job_seekers.user_id = users.id
      WHERE jobs.employer_id = $1
      ORDER BY applications.applied_at DESC
    `, [employerId]);

        res.json({ applications: result.rows });
    } catch (error) {
        console.error('Error fetching employer applications:', error);
        res.status(500).json({ error: error.message });
    }
});

// UPDATE APPLICATION STATUS
router.put('/:applicationId', async (req, res) => {
    const { applicationId } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ error: 'Status is required' });
    }

    try {
        const result = await db.query(
            'UPDATE applications SET status = $1 WHERE id = $2 RETURNING *',
            [status, applicationId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }

        res.json({
            message: 'Application status updated successfully!',
            application: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating application:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET ALL APPLICATIONS (ADMIN)
router.get('/all', async (req, res) => {
    try {
        const result = await db.query(`
      SELECT 
        applications.*,
        jobs.title as job_title,
        job_seekers.full_name as job_seeker_name,
        employers.company_name
      FROM applications
      JOIN jobs ON applications.job_id = jobs.id
      JOIN job_seekers ON applications.job_seeker_id = job_seekers.id
      JOIN employers ON jobs.employer_id = employers.id
      ORDER BY applications.applied_at DESC
    `);

        res.json({ applications: result.rows });
    } catch (error) {
        console.error('Error fetching all applications:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;