const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database-pg');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// SIGNUP ROUTE
router.post('/signup', async (req, res) => {
    const { email, password, userType, fullName, phone, skills, disabilityInfo, companyName, companySize, industry } = req.body;

    if (!email || !password || !userType || !fullName) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const userResult = await db.query(
            'INSERT INTO users (email, password, user_type) VALUES ($1, $2, $3) RETURNING id',
            [email, hashedPassword, userType]
        );

        const userId = userResult.rows[0].id;

        // Insert profile based on user type
        if (userType === 'Job Seeker') {
            await db.query(
                'INSERT INTO job_seekers (user_id, full_name, phone, skills, disability_info) VALUES ($1, $2, $3, $4, $5)',
                [userId, fullName, phone || '', skills || '', disabilityInfo || '']
            );
        } else if (userType === 'Employer') {
            await db.query(
                'INSERT INTO employers (user_id, full_name, company_name, company_size, industry) VALUES ($1, $2, $3, $4, $5)',
                [userId, fullName, companyName, companySize || '', industry || '']
            );
        }

        // Generate JWT token
        const token = jwt.sign({ userId, userType }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            message: 'User created successfully!',
            token,
            userId,
            userType
        });

    } catch (error) {
        if (error.constraint === 'users_email_key') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        console.error('Signup error:', error);
        res.status(500).json({ error: error.message });
    }
});

// LOGIN ROUTE
router.post('/login', async (req, res) => {
    const { email, password, userType } = req.body;

    if (!email || !password || !userType) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const result = await db.query(
            'SELECT * FROM users WHERE email = $1 AND user_type = $2',
            [email, userType]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // Compare password
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
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

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET USER PROFILE
router.get('/profile/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const userResult = await db.query('SELECT * FROM users WHERE id = $1', [userId]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = userResult.rows[0];
        let profile = null;

        if (user.user_type === 'Job Seeker') {
            const profileResult = await db.query('SELECT * FROM job_seekers WHERE user_id = $1', [userId]);
            profile = profileResult.rows[0];
        } else if (user.user_type === 'Employer') {
            const profileResult = await db.query('SELECT * FROM employers WHERE user_id = $1', [userId]);
            profile = profileResult.rows[0];
        }

        res.json({
            email: user.email,
            user_type: user.user_type,
            created_at: user.created_at,
            profile
        });

    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;