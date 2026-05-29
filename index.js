const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// The Pepper MUST NOT be stored in the database.
// It is stored as a constant in the server code (or preferably environment variable).
const PEPPER = "CyberSecurity_Secure_Pepper_2026!";

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database setup
const dbPath = path.join(__dirname, 'database', 'users.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        // Create users table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            salt TEXT NOT NULL
        )`);
    }
});

// Helper function to hash password
function generateHash(password, salt) {
    // 3 & 4. Combine: password + salt + pepper
    const combined = password + salt + PEPPER;
    // 5. Apply a secure hashing algorithm (SHA-256)
    return crypto.createHash('sha256').update(combined).digest('hex');
}

// Helper function to generate salt
function generateSalt() {
    return crypto.randomBytes(16).toString('hex');
}

// ============================================
// A. Registration Module
// ============================================
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    // 1. Validate password strength (Server-side validation)
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSymbol = /[\W_]/.test(password);
    const isLongEnough = password.length >= 12;

    if (!hasLower || !hasUpper || !hasDigit || !hasSymbol || !isLongEnough) {
        return res.status(400).json({ error: 'Password does not meet complexity requirements.' });
    }

    // 2. Generate a unique random salt
    const salt = generateSalt();

    // 3, 4, 5. Combine and Hash
    const passwordHash = generateHash(password, salt);

    // 6. Store in database: Username, Password Hash, Salt
    db.run(
        `INSERT INTO users (username, password_hash, salt) VALUES (?, ?, ?)`,
        [username, passwordHash, salt],
        function (err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: 'Username already exists' });
                }
                return res.status(500).json({ error: 'Database error: ' + err.message });
            }
            res.status(201).json({ message: 'Registration successful!' });
        }
    );
});

// ============================================
// B. Login Module
// ============================================
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    // 2. Retrieve stored salt from database
    db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (!user) {
            return res.status(401).json({ error: 'Invalid Username or Password' });
        }

        // 3 & 4. Recompute hash using: input_password + stored_salt + pepper
        const recomputedHash = generateHash(password, user.salt);

        // 5. Compare generated hash with stored hash
        if (recomputedHash === user.password_hash) {
            // 6. Display Login Successful
            res.json({ message: 'Login Successful' });
        } else {
            // 6. Display Invalid Username or Password
            res.status(401).json({ error: 'Invalid Username or Password' });
        }
    });
});

// ============================================
// Database Dashboard (For Screenshot Requirement)
// ============================================
app.get('/users', (req, res) => {
    // Only fetch required fields: Username, Password Hash, Salt
    // The pepper is NOT stored in the database.
    db.all(`SELECT username, password_hash, salt FROM users`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
