const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 8000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (CSS, JS, images)
app.use(express.static('public'));

// Database connection
const db = new sqlite3.Database('./database.db');

// Create the users table if it doesn't exist
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            course TEXT NOT NULL
        )
    `);
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/landing.html');
});

app.get('/form', (req, res) => {
    res.sendFile(__dirname + '/public/form.html');
});

app.post('/submit', (req, res) => {
    const { name, email, course } = req.body;

    // Save user data to the database
    db.run(
        'INSERT INTO users (name, email, course) VALUES (?, ?, ?)',
        [name, email, course],
        (err) => {
            if (err) {
                console.error("Error saving user data:", err);
                return res.status(500).send("Error saving user data");
            }

            // Redirect to the selected course page
            if (course === 'web') {
                res.redirect('/hello-web');
            } else if (course === 'ai') {
                res.redirect('/hello-ai');
            } else if (course === 'js') {
                res.redirect('/hello-js');
            } else if (course === 'uiuc') {
                res.redirect('/hello-uiuc');
            } else {
                res.status(400).send('Invalid course selection');
            }
        }
    );
});

app.get('/hello-web', (req, res) => {
    res.sendFile(__dirname + '/public/hello-web.html');
});

app.get('/hello-ai', (req, res) => {
    res.sendFile(__dirname + '/public/hello-ai.html');
});

app.get('/hello-js', (req, res) => {
    res.sendFile(__dirname + '/public/hello-js.html');
});

app.get('/hello-uiuc', (req, res) => {
    res.sendFile(__dirname + '/public/hello-uiuc.html');
});

// Quiz and Certificate Routes
app.get('/quiz.html', (req, res) => {
    res.sendFile(__dirname + '/public/quiz.html');
});

app.get('/pdf.html', (req, res) => {
    res.sendFile(__dirname + '/public/pdf.html');
});

// API to fetch the latest user's name
app.get('/api/user', (req, res) => {
    const query = `SELECT name FROM users ORDER BY id DESC LIMIT 1`;

    db.get(query, (err, row) => {
        if (err) {
            console.error('Error fetching user:', err);
            res.status(500).json({ error: 'Failed to fetch user' });
        } else {
            res.json({ name: row.name });
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});