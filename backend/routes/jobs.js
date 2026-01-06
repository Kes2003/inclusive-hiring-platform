const express = require('express');
const router = express.Router();
const db = require('../database');

// GET ALL JOBS (for job seekers to browse)
router.get('/', (req, res) => {
    const query = `
    SELECT 
      jobs.*,
      employers.company_name,
      employers.full_name as employer_name
    FROM jobs
    JOIN employers ON jobs.employer_id = employers.id
    WHERE jobs.status = 'Active'
    ORDER BY jobs.created_at DESC
  `;

    db.all(query, [], (err, jobs) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ jobs });
    });
});

// GET SINGLE JOB BY ID
router.get('/:jobId', (req, res) => {
    const { jobId } = req.params;

    const query = `
    SELECT 
      jobs.*,
      employers.company_name,
      employers.full_name as employer_name,
      employers.industry
    FROM jobs
    JOIN employers ON jobs.employer_id = employers.id
    WHERE jobs.id = ?
  `;

    db.get(query, [jobId], (err, job) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        res.json({ job });
    });
});

// POST NEW JOB (for employers)
router.post('/', (req, res) => {
    const { employerId, title, location, jobType, salary, description, accessibility } = req.body;

    // Validate required fields
    if (!employerId || !title || !location || !jobType || !description || !accessibility) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const query = `
    INSERT INTO jobs (employer_id, title, location, job_type, salary, description, accessibility_features)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

    db.run(
        query,
        [employerId, title, location, jobType, salary, description, accessibility],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.status(201).json({
                message: 'Job posted successfully!',
                jobId: this.lastID
            });
        }
    );
});

// GET JOBS BY EMPLOYER (for employer dashboard)
router.get('/employer/:employerId', (req, res) => {
    const { employerId } = req.params;

    const query = `
    SELECT 
      jobs.*,
      COUNT(applications.id) as applicant_count
    FROM jobs
    LEFT JOIN applications ON jobs.id = applications.job_id
    WHERE jobs.employer_id = ?
    GROUP BY jobs.id
    ORDER BY jobs.created_at DESC
  `;

    db.all(query, [employerId], (err, jobs) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ jobs });
    });
});

// UPDATE JOB
router.put('/:jobId', (req, res) => {
    const { jobId } = req.params;
    const { title, location, jobType, salary, description, accessibility, status } = req.body;

    const query = `
    UPDATE jobs 
    SET title = ?, location = ?, job_type = ?, salary = ?, 
        description = ?, accessibility_features = ?, status = ?
    WHERE id = ?
  `;

    db.run(
        query,
        [title, location, jobType, salary, description, accessibility, status, jobId],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: 'Job not found' });
            }

            res.json({ message: 'Job updated successfully!' });
        }
    );
});

// DELETE JOB
router.delete('/:jobId', (req, res) => {
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

module.exports = router;