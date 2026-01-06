const express = require('express');
const router = express.Router();
const db = require('../database');

// APPLY FOR A JOB
router.post('/', (req, res) => {
    const { jobSeekerId, jobId } = req.body;

    if (!jobSeekerId || !jobId) {
        return res.status(400).json({ error: 'Job seeker ID and job ID are required' });
    }

    // Check if already applied
    db.get(
        'SELECT * FROM applications WHERE job_seeker_id = ? AND job_id = ?',
        [jobSeekerId, jobId],
        (err, existingApplication) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (existingApplication) {
                return res.status(400).json({ error: 'You have already applied to this job' });
            }

            // Create application
            db.run(
                'INSERT INTO applications (job_seeker_id, job_id) VALUES (?, ?)',
                [jobSeekerId, jobId],
                function (err) {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }

                    res.status(201).json({
                        message: 'Application submitted successfully!',
                        applicationId: this.lastID
                    });
                }
            );
        }
    );
});

// GET APPLICATIONS FOR A JOB SEEKER
router.get('/job-seeker/:jobSeekerId', (req, res) => {
    const { jobSeekerId } = req.params;

    const query = `
    SELECT 
      applications.*,
      jobs.title as job_title,
      jobs.location,
      jobs.job_type,
      jobs.salary,
      employers.company_name
    FROM applications
    JOIN jobs ON applications.job_id = jobs.id
    JOIN employers ON jobs.employer_id = employers.id
    WHERE applications.job_seeker_id = ?
    ORDER BY applications.applied_at DESC
  `;

    db.all(query, [jobSeekerId], (err, applications) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ applications });
    });
});

// GET APPLICATIONS FOR A JOB (for employers)
router.get('/job/:jobId', (req, res) => {
    const { jobId } = req.params;

    const query = `
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
    WHERE applications.job_id = ?
    ORDER BY applications.applied_at DESC
  `;

    db.all(query, [jobId], (err, applications) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ applications });
    });
});

// GET ALL APPLICATIONS FOR AN EMPLOYER
router.get('/employer/:employerId', (req, res) => {
    const { employerId } = req.params;

    const query = `
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
    WHERE jobs.employer_id = ?
    ORDER BY applications.applied_at DESC
  `;

    db.all(query, [employerId], (err, applications) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ applications });
    });
});

// UPDATE APPLICATION STATUS (accept/reject)
router.put('/:applicationId', (req, res) => {
    const { applicationId } = req.params;
    const { status } = req.body;

    if (!['Pending', 'Accepted', 'Rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    db.run(
        'UPDATE applications SET status = ? WHERE id = ?',
        [status, applicationId],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: 'Application not found' });
            }

            res.json({ message: 'Application status updated successfully!' });
        }
    );
});

// GET ALL APPLICATIONS (for admin)
router.get('/all', (req, res) => {
    const query = `
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
  `;

    db.all(query, [], (err, applications) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ applications });
    });
});

module.exports = router;