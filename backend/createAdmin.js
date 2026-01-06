const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'hiring_platform.db');
const db = new sqlite3.Database(dbPath);

// Hash password
bcrypt.hash('admin123', 10, (err, hash) => {
    if (err) {
        console.error('Error hashing password:', err);
        process.exit(1);
    }

    // Insert admin user
    db.run(
        'INSERT INTO users (email, password, user_type) VALUES (?, ?, ?)',
        ['admin@platform.com', hash, 'Admin'],
        function (err) {
            if (err) {
                console.error('Error creating admin:', err.message);
                if (err.message.includes('UNIQUE')) {
                    console.log('Admin user already exists!');
                }
            } else {
                console.log('✅ Admin user created successfully!');
                console.log('📧 Email: admin@platform.com');
                console.log('🔑 Password: admin123');
            }
            db.close();
            process.exit();
        }
    );
});