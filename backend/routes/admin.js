const express = require('express');
const router = express.Router();
const db = require('../database');

// GET ALL USERS
router.get('/users', (req, res) => {
    const query = `
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
  `;

    db.all(query, [], (err, users) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ users });
    });
});

// GET ALL JOBS (for admin overview)
router.get('/jobs', (req, res) => {
    const query = `
    SELECT 
      jobs.*,
      employers.company_name,
      employers.full_name as employer_name,
      COUNT(applications.id) as applicant_count
    FROM jobs
    JOIN employers ON jobs.employer_id = employers.id
    LEFT JOIN applications ON jobs.id = applications.job_id
    GROUP BY jobs.id
    ORDER BY jobs.created_at DESC
  `;

    db.all(query, [], (err, jobs) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ jobs });
    });
});

// GET PLATFORM STATISTICS
router.get('/stats', (req, res) => {
    // Get counts for different entities
    const queries = {
        totalUsers: 'SELECT COUNT(*) as count FROM users',
        jobSeekers: "SELECT COUNT(*) as count FROM users WHERE user_type = 'Job Seeker'",
        employers: "SELECT COUNT(*) as count FROM users WHERE user_type = 'Employer'",
        totalJobs: 'SELECT COUNT(*) as count FROM jobs',
        activeJobs: "SELECT COUNT(*) as count FROM jobs WHERE status = 'Active'",
        totalApplications: 'SELECT COUNT(*) as count FROM applications',
        pendingApplications: "SELECT COUNT(*) as count FROM applications WHERE status = 'Pending'",
        acceptedApplications: "SELECT COUNT(*) as count FROM applications WHERE status = 'Accepted'",
        rejectedApplications: "SELECT COUNT(*) as count FROM applications WHERE status = 'Rejected'"
    };

    const stats = {};
    let completed = 0;
    const total = Object.keys(queries).length;

    Object.keys(queries).forEach(key => {
        db.get(queries[key], [], (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            stats[key] = result.count;
            completed++;

            if (completed === total) {
                res.json({ stats });
            }
        });
    });
});

// DELETE USER
router.delete('/users/:userId', (req, res) => {
    const { userId } = req.params;

    db.run('DELETE FROM users WHERE id = ?', [userId], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User deleted successfully!' });
    });
});

// DELETE JOB
router.delete('/jobs/:jobId', (req, res) => {
    const { jobId } = req.params;

    db.run('DELETE FROM jobs WHERE id = ?', [jobId], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'Job not found' });
        }

        res.json({ message: 'Job deleted successfully!' });
    });
});

// GET RECENT ACTIVITY (for activity feed)
router.get('/activity', (req, res) => {
    const query = `
    SELECT 
      'application' as type,
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
  `;

    db.all(query, [], (err, activities) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ activities });
    });
});
// CREATE NEW ADMIN (only accessible by existing admins)
router.post('/create-admin', async (req, res) => {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const bcrypt = require('bcrypt');

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert into users table
        db.run(
            'INSERT INTO users (email, password, user_type) VALUES (?, ?, ?)',
            [email, hashedPassword, 'Admin'],
            function (err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(400).json({ error: 'Email already exists' });
                    }
                    return res.status(500).json({ error: err.message });
                }

                res.status(201).json({
                    message: 'Admin created successfully!',
                    adminId: this.lastID
                });
            }
        );
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CHECK IF ANY ADMIN EXISTS (for initial setup)
router.get('/check-admin-exists', (req, res) => {
    db.get(
        "SELECT COUNT(*) as count FROM users WHERE user_type = 'Admin'",
        [],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ adminExists: result.count > 0 });
        }
    );
});

module.exports = router;