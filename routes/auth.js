const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;
const normalizeEmail = (email) => email.trim().toLowerCase();
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isDuplicateKeyError = (err) => Boolean(err && err.code === 11000);

const LOGIN_WINDOW_MS = 10 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 8;
const MAX_TRACKED_LOGIN_KEYS = 10000;
const loginAttemptsByKey = new Map();

const getClientIp = (req) => {
    const forwardedFor = req.headers['x-forwarded-for'];
    if (typeof forwardedFor === 'string' && forwardedFor.trim().length > 0) {
        return forwardedFor.split(',')[0].trim();
    }

    return req.ip || req.socket?.remoteAddress || 'unknown-ip';
};

const getLoginAttemptKey = (req, normalizedEmail) => `${getClientIp(req)}:${normalizedEmail}`;

const pruneLoginAttempts = (now) => {
    for (const [key, record] of loginAttemptsByKey.entries()) {
        const isExpired = now - record.lastAttemptAt >= LOGIN_WINDOW_MS && record.blockUntil <= now;
        if (isExpired) {
            loginAttemptsByKey.delete(key);
        }
    }

    while (loginAttemptsByKey.size > MAX_TRACKED_LOGIN_KEYS) {
        const oldestKey = loginAttemptsByKey.keys().next().value;
        if (!oldestKey) break;
        loginAttemptsByKey.delete(oldestKey);
    }
};

const getOrCreateAttemptRecord = (key, now) => {
    const existing = loginAttemptsByKey.get(key);
    if (!existing || now - existing.windowStart >= LOGIN_WINDOW_MS) {
        const fresh = {
            attempts: 0,
            windowStart: now,
            lastAttemptAt: now,
            blockUntil: 0
        };
        loginAttemptsByKey.set(key, fresh);
        return fresh;
    }

    existing.lastAttemptAt = now;
    return existing;
};

const markFailedLoginAttempt = (key) => {
    if (!key) return;

    const now = Date.now();
    const record = getOrCreateAttemptRecord(key, now);

    if (record.blockUntil > now) {
        return;
    }

    record.attempts += 1;
    record.lastAttemptAt = now;

    if (record.attempts >= LOGIN_MAX_ATTEMPTS) {
        record.blockUntil = now + LOGIN_WINDOW_MS;
    }
};

const clearLoginAttemptsForKey = (key) => {
    if (!key) return;
    loginAttemptsByKey.delete(key);
};

const applyLoginRateLimit = (req, res, next) => {
    const normalizedEmail = isNonEmptyString(req.body?.email)
        ? normalizeEmail(req.body.email)
        : 'unknown-email';
    const key = getLoginAttemptKey(req, normalizedEmail);
    const now = Date.now();

    pruneLoginAttempts(now);
    const record = getOrCreateAttemptRecord(key, now);

    if (record.blockUntil > now) {
        const retryAfterSeconds = Math.ceil((record.blockUntil - now) / 1000);
        res.set('Retry-After', String(retryAfterSeconds));
        return res.status(429).json({ msg: 'Too many login attempts. Please try again later.' });
    }

    req.loginRateLimitKey = key;
    next();
};

// @route   POST api/auth/register
router.post('/register', async (req, res) => {
    try {
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

        user = new User({ 
            name: name.trim(), 
            email: normalizedEmail, 
            password: hashedPassword,
            phone: isNonEmptyString(phone) ? phone.trim() : ''
        });
        
        await user.save();
        res.status(201).json({ msg: "User registered successfully!" });
    } catch (err) {
        if (isDuplicateKeyError(err)) {
            return res.status(409).json({ msg: "User already exists" });
        }

        console.error('REGISTER_ERROR:', err);
        res.status(500).json({ msg: "Server error" });
    }
});

// @route   POST api/auth/login
router.post('/login', applyLoginRateLimit, async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
            return res.status(400).json({ msg: "Email and password are required." });
        }

        const normalizedEmail = normalizeEmail(email);
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            markFailedLoginAttempt(req.loginRateLimitKey);
            return res.status(401).json({ msg: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            markFailedLoginAttempt(req.loginRateLimitKey);
            return res.status(401).json({ msg: "Invalid credentials" });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ msg: "Server configuration error" });
        }

        clearLoginAttemptsForKey(req.loginRateLimitKey);
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
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
