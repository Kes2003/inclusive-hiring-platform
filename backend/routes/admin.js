const express = require('express');
const router = express.Router();
const db = require('../database-pg');

// GET ALL USERS
router.get('/users', async (req, res) => {
    try {
        const result = await db.query(`
      SELECT 
        users.id,
        users.email,
        users.user_type,
        users.created_at,
        CASE 
          WHEN users.user_type = 'Job Seeker' THEN job_seekers.full_name
          WHEN users.user_type = 'Employer' THEN employers.full_name
          ELSE 'Admin'
        END as name,
        CASE 
          WHEN users.user_type = 'Employer' THEN employers.company_name
          ELSE NULL
        END as company_name
      FROM users
      LEFT JOIN job_seekers ON users.id = job_seekers.user_id
      LEFT JOIN employers ON users.id = employers.user_id
      ORDER BY users.created_at DESC
    `);

        res.json({ users: result.rows });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET ALL JOBS (ADMIN)
router.get('/jobs', async (req, res) => {
    try {
        const result = await db.query(`
      SELECT 
        jobs.*,
        employers.company_name,
        employers.full_name as employer_name,
        COUNT(applications.id) as applicant_count
      FROM jobs
      JOIN employers ON jobs.employer_id = employers.id
      LEFT JOIN applications ON jobs.id = applications.job_id
      GROUP BY jobs.id, employers.company_name, employers.full_name
      ORDER BY jobs.created_at DESC
    `);

        res.json({ jobs: result.rows });
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET PLATFORM STATISTICS
router.get('/stats', async (req, res) => {
    try {
        const stats = {};

        const totalUsers = await db.query('SELECT COUNT(*) FROM users');
        stats.totalUsers = parseInt(totalUsers.rows[0].count);

        const jobSeekers = await db.query("SELECT COUNT(*) FROM users WHERE user_type = 'Job Seeker'");
        stats.jobSeekers = parseInt(jobSeekers.rows[0].count);

        const employers = await db.query("SELECT COUNT(*) FROM users WHERE user_type = 'Employer'");
        stats.employers = parseInt(employers.rows[0].count);

        const totalJobs = await db.query('SELECT COUNT(*) FROM jobs');
        stats.totalJobs = parseInt(totalJobs.rows[0].count);

        const activeJobs = await db.query("SELECT COUNT(*) FROM jobs WHERE status = 'Active'");
        stats.activeJobs = parseInt(activeJobs.rows[0].count);

        const totalApplications = await db.query('SELECT COUNT(*) FROM applications');
        stats.totalApplications = parseInt(totalApplications.rows[0].count);

        const pendingApplications = await db.query("SELECT COUNT(*) FROM applications WHERE status = 'Pending'");
        stats.pendingApplications = parseInt(pendingApplications.rows[0].count);

        const acceptedApplications = await db.query("SELECT COUNT(*) FROM applications WHERE status = 'Accepted'");
        stats.acceptedApplications = parseInt(acceptedApplications.rows[0].count);

        const rejectedApplications = await db.query("SELECT COUNT(*) FROM applications WHERE status = 'Rejected'");
        stats.rejectedApplications = parseInt(rejectedApplications.rows[0].count);

        res.json({ stats });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE USER
router.delete('/users/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING *', [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User deleted successfully!' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE JOB
router.delete('/jobs/:jobId', async (req, res) => {
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

// GET RECENT ACTIVITY
router.get('/activity', async (req, res) => {
    try {
        const result = await db.query(`
      SELECT 
        applications.id,
        applications.applied_at as timestamp,
        job_seekers.full_name as user_name,
        jobs.title as job_title,
        employers.company_name
      FROM applications
      JOIN job_seekers ON applications.job_seeker_id = job_seekers.id
      JOIN jobs ON applications.job_id = jobs.id
      JOIN employers ON jobs.employer_id = employers.id
      ORDER BY applications.applied_at DESC
      LIMIT 10
    `);

        res.json({ activities: result.rows });
    } catch (error) {
        console.error('Error fetching activity:', error);
        res.status(500).json({ error: error.message });
    }
});

// CREATE ADMIN
router.post('/create-admin', async (req, res) => {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await db.query(
            'INSERT INTO users (email, password, user_type) VALUES ($1, $2, $3) RETURNING id',
            [email, hashedPassword, 'Admin']
        );

        res.status(201).json({
            message: 'Admin created successfully!',
            adminId: result.rows[0].id
        });
    } catch (error) {
        if (error.constraint === 'users_email_key') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        console.error('Error creating admin:', error);
        res.status(500).json({ error: error.message });
    }
});

// CHECK IF ADMIN EXISTS
router.get('/check-admin-exists', async (req, res) => {
    try {
        const result = await db.query("SELECT COUNT(*) FROM users WHERE user_type = 'Admin'");
        const count = parseInt(result.rows[0].count);
        res.json({ adminExists: count > 0 });
    } catch (error) {
        console.error('Error checking admin:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;