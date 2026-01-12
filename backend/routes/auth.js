// SIGNUP ROUTE with detailed logging
router.post('/signup', async (req, res) => {
    const { email, password, userType, fullName, phone, skills, disabilityInfo, companyName, companySize, industry } = req.body;

    console.log('=== SIGNUP REQUEST ===');
    console.log('User Type:', userType);
    console.log('Email:', email);
    console.log('Full Name:', fullName);

    if (!email || !password || !userType || !fullName) {
        console.log('ERROR: Missing required fields');
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Hash password
        console.log('Hashing password...');
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Password hashed successfully');

        // Insert user
        console.log('Inserting user into users table...');
        const userResult = await db.query(
            'INSERT INTO users (email, password, user_type) VALUES ($1, $2, $3) RETURNING id',
            [email, hashedPassword, userType]
        );

        const userId = userResult.rows[0].id;
        console.log('User created with ID:', userId);

        // Insert profile based on user type
        if (userType === 'Job Seeker') {
            console.log('Creating Job Seeker profile...');
            console.log('Data:', { userId, fullName, phone, skills, disabilityInfo });

            const jsResult = await db.query(
                'INSERT INTO job_seekers (user_id, full_name, phone, skills, disability_info) VALUES ($1, $2, $3, $4, $5) RETURNING id',
                [userId, fullName, phone || '', skills || '', disabilityInfo || '']
            );

            console.log('Job Seeker profile created with ID:', jsResult.rows[0].id);

        } else if (userType === 'Employer') {
            console.log('Creating Employer profile...');
            console.log('Data:', { userId, fullName, companyName, companySize, industry });

            const empResult = await db.query(
                'INSERT INTO employers (user_id, full_name, company_name, company_size, industry) VALUES ($1, $2, $3, $4, $5) RETURNING id',
                [userId, fullName, companyName, companySize || '', industry || '']
            );

            console.log('Employer profile created with ID:', empResult.rows[0].id);
        }

        // Generate JWT token
        console.log('Generating JWT token...');
        const token = jwt.sign({ userId, userType }, JWT_SECRET, { expiresIn: '7d' });
        console.log('=== SIGNUP SUCCESSFUL ===');

        res.status(201).json({
            message: 'User created successfully!',
            token,
            userId,
            userType
        });

    } catch (error) {
        console.error('=== SIGNUP ERROR ===');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);

        if (error.constraint === 'users_email_key') {
            return res.status(400).json({ error: 'Email already exists' });
        }

        res.status(500).json({ error: error.message });
    }
});

// GET USER PROFILE with detailed logging
router.get('/profile/:userId', async (req, res) => {
    const { userId } = req.params;

    console.log('=== FETCHING PROFILE ===');
    console.log('User ID:', userId);

    try {
        const userResult = await db.query('SELECT * FROM users WHERE id = $1', [userId]);

        if (userResult.rows.length === 0) {
            console.log('ERROR: User not found');
            return res.status(404).json({ error: 'User not found' });
        }

        const user = userResult.rows[0];
        console.log('User found:', user.email, user.user_type);

        let profile = null;

        if (user.user_type === 'Job Seeker') {
            console.log('Fetching Job Seeker profile...');
            const profileResult = await db.query('SELECT * FROM job_seekers WHERE user_id = $1', [userId]);
            profile = profileResult.rows[0];
            console.log('Job Seeker profile:', profile ? `Found (ID: ${profile.id})` : 'NOT FOUND');

            if (!profile) {
                console.log('WARNING: Job Seeker profile missing for user', userId);
                return res.status(404).json({ error: 'Job Seeker profile not found. Please contact support.' });
            }

        } else if (user.user_type === 'Employer') {
            console.log('Fetching Employer profile...');
            const profileResult = await db.query('SELECT * FROM employers WHERE user_id = $1', [userId]);
            profile = profileResult.rows[0];
            console.log('Employer profile:', profile ? `Found (ID: ${profile.id})` : 'NOT FOUND');

            if (!profile) {
                console.log('WARNING: Employer profile missing for user', userId);
                return res.status(404).json({ error: 'Employer profile not found. Please contact support.' });
            }
        }

        console.log('=== PROFILE FETCH SUCCESSFUL ===');

        res.json({
            email: user.email,
            user_type: user.user_type,
            created_at: user.created_at,
            profile
        });

    } catch (error) {
        console.error('=== PROFILE FETCH ERROR ===');
        console.error('Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});