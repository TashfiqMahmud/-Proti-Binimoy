const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const normalizeEmail = (email) => email.trim().toLowerCase();

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// @route   POST api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body || {};

        if (!isNonEmptyString(name) || !isNonEmptyString(email) || !isNonEmptyString(password)) {
            return res.status(400).json({ msg: "Name, email, and password are required." });
        }

        const trimmedName = name.trim();
        const normalizedEmail = normalizeEmail(email);

        if (!isValidEmail(normalizedEmail)) {
            return res.status(400).json({ msg: "Please provide a valid email address." });
        }

        if (password.trim().length < 8) {
            return res.status(400).json({ msg: "Password must be at least 8 characters long." });
        }

        let user = await User.findOne({ email: normalizedEmail });
        if (user) return res.status(409).json({ msg: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        user = new User({ name: trimmedName, email: normalizedEmail, password: hashedPassword });
        await user.save();

        res.status(201).json({ msg: "User registered successfully!" });
    } catch (err) {
        if (err && err.code === 11000) {
            return res.status(409).json({ msg: "User already exists" });
        }

        console.error('REGISTER_ERROR:', err);
        res.status(500).json({ msg: "Server error" });
    }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
            return res.status(400).json({ msg: "Email and password are required." });
        }

        const normalizedEmail = normalizeEmail(email);
        if (!isValidEmail(normalizedEmail)) {
            return res.status(400).json({ msg: "Please provide a valid email address." });
        }

        if (!process.env.JWT_SECRET) {
            console.error('LOGIN_ERROR: JWT_SECRET is missing.');
            return res.status(500).json({ msg: "Server configuration error" });
        }

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) return res.status(401).json({ msg: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ msg: "Invalid credentials" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (err) {
        console.error('LOGIN_ERROR:', err);
        res.status(500).json({ msg: "Server error" });
    }
});

module.exports = router;
