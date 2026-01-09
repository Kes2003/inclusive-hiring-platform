const { Pool } = require('pg');

// PostgreSQL connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to PostgreSQL:', err.stack);
    } else {
        console.log('Connected to PostgreSQL database');
        release();
    }
});

// Initialize database tables
const initDatabase = async () => {
    try {
        // Create Users table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        user_type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        console.log('Users table ready');

        // Create Job Seekers table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS job_seekers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        skills TEXT,
        disability_info TEXT,
        resume_path VARCHAR(500),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
        console.log('Job Seekers table ready');

        // Create Employers table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS employers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        company_name VARCHAR(255) NOT NULL,
        company_size VARCHAR(50),
        industry VARCHAR(100),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
        console.log('Employers table ready');

        // Create Jobs table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        employer_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        job_type VARCHAR(50) NOT NULL,
        salary VARCHAR(100),
        description TEXT NOT NULL,
        accessibility_features TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employer_id) REFERENCES employers(id) ON DELETE CASCADE
      )
    `);
        console.log('Jobs table ready');

        // Create Applications table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,
        job_seeker_id INTEGER NOT NULL,
        job_id INTEGER NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (job_seeker_id) REFERENCES job_seekers(id) ON DELETE CASCADE,
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
        UNIQUE(job_seeker_id, job_id)
      )
    `);
        console.log('Applications table ready');

        console.log('✅ All database tables initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
};

// Initialize tables on startup
initDatabase();

module.exports = pool;