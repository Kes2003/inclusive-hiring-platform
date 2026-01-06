const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database file path
const dbPath = path.join(__dirname, 'database', 'hiring_platform.db');

// Create/connect to database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Create tables
const createTables = () => {
    // Users table - stores common user info
    db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      user_type TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
        if (err) console.error('Error creating users table:', err);
        else console.log('Users table ready');
    });

    // Job Seekers table - stores job seeker specific data
    db.run(`
    CREATE TABLE IF NOT EXISTS job_seekers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      skills TEXT,
      disability_info TEXT,
      resume_path TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `, (err) => {
        if (err) console.error('Error creating job_seekers table:', err);
        else console.log('Job Seekers table ready');
    });

    // Employers table - stores employer specific data
    db.run(`
    CREATE TABLE IF NOT EXISTS employers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      full_name TEXT NOT NULL,
      company_name TEXT NOT NULL,
      company_size TEXT,
      industry TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `, (err) => {
        if (err) console.error('Error creating employers table:', err);
        else console.log('Employers table ready');
    });

    // Jobs table - stores job postings
    db.run(`
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employer_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      location TEXT NOT NULL,
      job_type TEXT NOT NULL,
      salary TEXT,
      description TEXT NOT NULL,
      accessibility_features TEXT NOT NULL,
      status TEXT DEFAULT 'Active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employer_id) REFERENCES employers(id) ON DELETE CASCADE
    )
  `, (err) => {
        if (err) console.error('Error creating jobs table:', err);
        else console.log('Jobs table ready');
    });

    // Applications table - stores job applications
    db.run(`
    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_seeker_id INTEGER NOT NULL,
      job_id INTEGER NOT NULL,
      status TEXT DEFAULT 'Pending',
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (job_seeker_id) REFERENCES job_seekers(id) ON DELETE CASCADE,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    )
  `, (err) => {
        if (err) console.error('Error creating applications table:', err);
        else console.log('Applications table ready');
    });
};

// Initialize tables
createTables();

module.exports = db;