const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database');

// Secret key for JWT (in production, this should be in environment variables)
const JWT_SECRET = 'your-secret-key-change-this-in-production';

// SIGNUP ROUTE
router.post('/signup', async (req, res) => {
    const { email, password, userType, ...profileData } = req.body;

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert into users table
        db.run(
            'INSERT INTO users (email, password, user_type) VALUES (?, ?, ?)',
            [email, hashedPassword, userType],
            function (err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(400).json({ error: 'Email already exists' });
                    }
                    return res.status(500).json({ error: err.message });
                }

                const userId = this.lastID;

                // Insert into appropriate profile table
                if (userType === 'Job Seeker') {
                    db.run(
                        `INSERT INTO job_seekers (user_id, full_name, phone, skills, disability_info) 
             VALUES (?, ?, ?, ?, ?)`,
                        [userId, profileData.fullName, profileData.phone, profileData.skills, profileData.disabilityInfo],
                        (err) => {
                            if (err) {
                                return res.status(500).json({ error: err.message });
                            }

                            // Generate JWT token
                            const token = jwt.sign({ userId, userType }, JWT_SECRET, { expiresIn: '7d' });

                            res.status(201).json({
                                message: 'Job Seeker registered successfully!',
                                token,
                                userId,
                                userType
                            });
                        }
                    );
                } else if (userType === 'Employer') {
                    db.run(
                        `INSERT INTO employers (user_id, full_name, company_name, company_size, industry) 
             VALUES (?, ?, ?, ?, ?)`,
                        [userId, profileData.fullName, profileData.companyName, profileData.companySize, profileData.industry],
                        (err) => {
                            if (err) {
                                return res.status(500).json({ error: err.message });
                            }

                            const token = jwt.sign({ userId, userType }, JWT_SECRET, { expiresIn: '7d' });

                            res.status(201).json({
                                message: 'Employer registered successfully!',
                                token,
                                userId,
                                userType
                            });
                        }
                    );
                }
            }
        );
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// LOGIN ROUTE
router.post('/login', (req, res) => {
    const { email, password, userType } = req.body;

    // Find user by email and user type
    db.get(
        'SELECT * FROM users WHERE email = ? AND user_type = ?',
        [email, userType],
        async (err, user) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (!user) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            // Check password
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            // Generate JWT token
            const token = jwt.sign(
                { userId: user.id, userType: user.user_type },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.json({
                message: 'Login successful!',
                token,
                userId: user.id,
                userType: user.user_type
            });
        }
    );
});

// GET USER PROFILE
router.get('/profile/:userId', (req, res) => {
    const { userId } = req.params;

    db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get profile data based on user type
        if (user.user_type === 'Job Seeker') {
            db.get('SELECT * FROM job_seekers WHERE user_id = ?', [userId], (err, profile) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.json({ ...user, profile });
            });
        } else if (user.user_type === 'Employer') {
            db.get('SELECT * FROM employers WHERE user_id = ?', [userId], (err, profile) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.json({ ...user, profile });
            });
        }
    });
});

module.exports = router;