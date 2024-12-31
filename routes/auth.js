const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { getDB } = require('../db');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

// POST registration route
router.post('/register', async (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password || !role || !['student', 'professor'].includes(role)) {
        return res.status(400).json({ message: 'Invalid input' });
    }

    try {
        const db = getDB();
        const usersCollection = db.collection('users');

        const existingUser = await usersCollection.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const result = await usersCollection.insertOne({ username, password, role });
        const token = jwt.sign({ user_id: result.insertedId, role }, JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ message: 'Registration successful', token });
    } catch (err) {
        res.status(500).json({ message: 'Error registering user', error: err });
    }
});

// POST login route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Missing username or password' });
    }

    try {
        const db = getDB();
        const usersCollection = db.collection('users');

        const user = await usersCollection.findOne({ username, password });
        if (!user) {
            return res.status(401).json({ message: 'Incorrect username or password' });
        }

        const token = jwt.sign({ user_id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

        res.json({ message: 'Login successful', token, user });
    } catch (err) {
        res.status(500).json({ message: 'Error logging in', error: err });
    }
});

module.exports = router;
