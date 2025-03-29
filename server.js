const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'video_player_db'
};

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// File upload configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Database connection pool
const pool = mysql.createPool(dbConfig);

// Authentication middleware
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const user = jwt.verify(token, JWT_SECRET);
        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid token' });
    }
};

// Auth routes
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);

        await pool.execute(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
            [user.id]
        );

        res.json({ token, user: { id: user.id, username: user.username } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Video routes
app.post('/api/videos/upload', authenticateToken, upload.single('video'), async (req, res) => {
    const { title, description, privacy_status } = req.body;
    const file = req.file;

    try {
        const [result] = await pool.execute(
            'INSERT INTO videos (title, description, filename, file_path, duration, size, format, user_id, privacy_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [title, description, file.filename, file.path, 0, file.size, path.extname(file.filename), req.user.id, privacy_status]
        );

        res.json({ id: result.insertId, message: 'Video uploaded successfully' });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload video' });
    }
});

app.get('/api/videos/:id', async (req, res) => {
    try {
        const [videos] = await pool.execute(
            'SELECT v.*, u.username FROM videos v JOIN users u ON v.user_id = u.id WHERE v.id = ?',
            [req.params.id]
        );

        if (videos.length === 0) {
            return res.status(404).json({ error: 'Video not found' });
        }

        res.json(videos[0]);
    } catch (error) {
        console.error('Video fetch error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Playlist routes
app.post('/api/playlists', authenticateToken, async (req, res) => {
    const { name, description, privacy_status } = req.body;

    try {
        const [result] = await pool.execute(
            'INSERT INTO playlists (name, description, user_id, privacy_status) VALUES (?, ?, ?, ?)',
            [name, description, req.user.id, privacy_status]
        );

        res.json({ id: result.insertId, message: 'Playlist created successfully' });
    } catch (error) {
        console.error('Playlist creation error:', error);
        res.status(500).json({ error: 'Failed to create playlist' });
    }
});

// Analytics routes
app.post('/api/analytics', authenticateToken, async (req, res) => {
    const { video_id, event_type, event_data } = req.body;

    try {
        await pool.execute(
            'INSERT INTO analytics_events (video_id, user_id, event_type, event_data) VALUES (?, ?, ?, ?)',
            [video_id, req.user.id, event_type, JSON.stringify(event_data)]
        );

        res.json({ message: 'Analytics event recorded' });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ error: 'Failed to record analytics' });
    }
});

// Settings routes
app.get('/api/settings', authenticateToken, async (req, res) => {
    try {
        const [settings] = await pool.execute(
            'SELECT * FROM user_settings WHERE user_id = ?',
            [req.user.id]
        );

        if (settings.length === 0) {
            return res.json({
                theme_preference: {},
                player_settings: {},
                notification_settings: {}
            });
        }

        res.json(settings[0]);
    } catch (error) {
        console.error('Settings fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

app.post('/api/settings', authenticateToken, async (req, res) => {
    const { theme_preference, player_settings, notification_settings } = req.body;

    try {
        await pool.execute(
            'INSERT INTO user_settings (user_id, theme_preference, player_settings, notification_settings) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE theme_preference = VALUES(theme_preference), player_settings = VALUES(player_settings), notification_settings = VALUES(notification_settings)',
            [req.user.id, JSON.stringify(theme_preference), JSON.stringify(player_settings), JSON.stringify(notification_settings)]
        );

        res.json({ message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Settings update error:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Cleanup on shutdown
process.on('SIGINT', async () => {
    try {
        await pool.end();
        console.log('Database connection closed.');
        process.exit(0);
    } catch (error) {
        console.error('Error during cleanup:', error);
        process.exit(1);
    }
});