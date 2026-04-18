const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;
const normalizeEmail = (email) => email.trim().toLowerCase();
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// @route   POST api/auth/register
router.post('/register', async (req, res) => {
    try {
        // Added 'phone' to the destructuring
        const { name, email, password, phone } = req.body || {};

        if (!isNonEmptyString(name) || !isNonEmptyString(email) || !isNonEmptyString(password)) {
            return res.status(400).json({ msg: "Name, email, and password are required." });
        }

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

        // Created user with the new phone field
        user = new User({ 
            name: name.trim(), 
            email: normalizedEmail, 
            password: hashedPassword,
            phone: phone || "" // Optional field
        });
        
        await user.save();
        res.status(201).json({ msg: "User registered successfully!" });
    } catch (err) {
        console.error('REGISTER_ERROR:', err);
        res.status(500).json({ msg: "Server error" });
    }
});

// @route   POST api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
            return res.status(400).json({ msg: "Email and password are required." });
        }

        const normalizedEmail = normalizeEmail(email);
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) return res.status(401).json({ msg: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ msg: "Invalid credentials" });

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ msg: "Server configuration error" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        // Return phone and location so the frontend can use them immediately after login
        res.json({ 
            token, 
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email,
                phone: user.phone,
                location: user.location
            } 
        });
    } catch (err) {
        console.error('LOGIN_ERROR:', err);
        res.status(500).json({ msg: "Server error" });
    }
});

module.exports = router;