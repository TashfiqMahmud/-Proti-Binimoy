const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const xss = require('xss');
const User = require('../models/User');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { msg: 'Too many login attempts. Please try again in 15 minutes.' }
});

const generalLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { msg: 'Too many requests. Please try again in an hour.' }
});

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;
const normalizeEmail = (email) => email.trim().toLowerCase();
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const normalizePhone = (phone) => String(phone || '').replace(/\D/g, '');
const isValidPhone = (phone) => /^\d{11}$/.test(phone);
const isValidOtp = (otp) => /^\d{6}$/.test(String(otp || '').trim());
const FORGOT_PASSWORD_RESPONSE = { msg: 'If that email is registered, a reset link has been sent.' };

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails[0].value.toLowerCase();
        let user = await User.findOne({ email });
        if (!user) {
            user = new User({
                googleId: profile.id,
                name: profile.displayName,
                email: email,
                profilePicture: profile.photos?.[0]?.value || '',
                isVerified: true,
                phone: ''
            });
            await user.save();
        }
        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
}));

// @route   POST api/auth/register
router.post('/register', generalLimiter, async (req, res) => {
    try {
        const { name, email, password, phone, nid, dateOfBirth, passportNumber } = req.body || {};

        if (!isNonEmptyString(name) || !isNonEmptyString(email) || !isNonEmptyString(password)) {
            return res.status(400).json({ msg: 'Name, email, and password are required.' });
        }

        const normalizedEmail = normalizeEmail(email);

        if (!isValidEmail(normalizedEmail)) {
            return res.status(400).json({ msg: 'Please provide a valid email address.' });
        }

        if (password.trim().length < 8) {
            return res.status(400).json({ msg: 'Password must be at least 8 characters long.' });
        }

        let user = await User.findOne({ email: normalizedEmail });
        if (user) {
            return res.status(409).json({ msg: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const trimmedName = xss(name.trim());

        user = new User({
            name: trimmedName,
            email: normalizedEmail,
            password: hashedPassword,
            phone: isNonEmptyString(phone) ? normalizePhone(phone) : '',
            nid: nid ? xss(String(nid).replace(/\D/g, '')) : undefined,
            dateOfBirth: dateOfBirth || undefined,
            passportNumber: passportNumber ? xss(String(passportNumber).trim()) : undefined
        });

        await user.save();
        return res.status(201).json({ msg: 'User registered successfully!' });
    } catch (err) {
        console.error('REGISTER_ERROR:', err);
        return res.status(500).json({ msg: 'Server error' });
    }
});

// @route   POST api/auth/login
router.post('/login', loginLimiter, async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
            return res.status(400).json({ msg: 'Email and password are required.' });
        }

        const normalizedEmail = normalizeEmail(email);
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(401).json({ msg: 'Invalid credentials' });
        }

        // Block Google-only accounts from password login
        if (!user.password) {
            return res.status(401).json({ msg: 'Please sign in with Google.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ msg: 'Invalid credentials' });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ msg: 'Server configuration error' });
        }

        // Updated to 7d
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        return res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                location: user.location,
                profilePicture: user.profilePicture,
                rating: user.rating,
                isVerified: user.isVerified
            }
        });
    } catch (err) {
        console.error('LOGIN_ERROR:', err);
        return res.status(500).json({ msg: 'Server error' });
    }
});

// @route   POST api/auth/email/check
router.post('/email/check', generalLimiter, async (req, res) => {
    try {
        const { email } = req.body || {};

        if (!isNonEmptyString(email)) {
            return res.status(400).json({ msg: 'Email is required.' });
        }

        const normalizedEmail = normalizeEmail(email);
        if (!isValidEmail(normalizedEmail)) {
            return res.status(400).json({ msg: 'Please provide a valid email address.' });
        }

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(404).json({ msg: 'This email is not registered. Please create an account first.' });
        }

        return res.status(200).json({ msg: 'Email found.' });
    } catch (err) {
        console.error('EMAIL_CHECK_ERROR:', err);
        return res.status(500).json({ msg: 'Server error' });
    }
});

// @route   POST api/auth/phone/check
router.post('/phone/check', generalLimiter, async (req, res) => {
    try {
        const { phone } = req.body || {};
        const normalizedPhone = normalizePhone(phone);

        if (!isValidPhone(normalizedPhone)) {
            return res.status(400).json({ msg: 'Enter a valid 11-digit phone number.' });
        }

        const user = await User.findOne({ phone: normalizedPhone });
        if (!user) {
            return res.status(404).json({ msg: 'This number is not registered. Please create an account first.' });
        }

        console.log(`OTP requested for: ${normalizedPhone}`);
        return res.status(200).json({ msg: 'OTP sent.' });
    } catch (err) {
        console.error('PHONE_CHECK_ERROR:', err);
        return res.status(500).json({ msg: 'Server error' });
    }
});

// @route   POST api/auth/phone/verify
router.post('/phone/verify', generalLimiter, async (req, res) => {
    try {
        const { phone, otp } = req.body || {};
        const normalizedPhone = normalizePhone(phone);
        const otpValue = String(otp || '').trim();

        if (!isValidPhone(normalizedPhone) || !isNonEmptyString(otpValue)) {
            return res.status(400).json({ msg: 'Phone and OTP are required.' });
        }

        if (!isValidOtp(otpValue)) {
            return res.status(400).json({ msg: 'Invalid OTP format.' });
        }

        const user = await User.findOne({ phone: normalizedPhone });
        if (!user) {
            return res.status(401).json({ msg: 'Invalid credentials.' });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ msg: 'Server configuration error' });
        }

        // Updated to 7d
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        return res.status(200).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                location: user.location,
                profilePicture: user.profilePicture,
                isVerified: user.isVerified
            }
        });
    } catch (err) {
        console.error('PHONE_VERIFY_ERROR:', err);
        return res.status(500).json({ msg: 'Server error' });
    }
});

// @route   POST api/auth/forgot-password
router.post('/forgot-password', generalLimiter, async (req, res) => {
    try {
        const { email } = req.body || {};

        if (!isNonEmptyString(email)) {
            return res.status(400).json({ msg: 'Email is required.' });
        }

        const normalizedEmail = xss(normalizeEmail(email));

        if (!isValidEmail(normalizedEmail)) {
            return res.status(400).json({ msg: 'Please provide a valid email address.' });
        }

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(200).json(FORGOT_PASSWORD_RESPONSE);
        }

        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(normalizedEmail)}`;

        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT),
            secure: Number(process.env.EMAIL_PORT) === 465,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const text = [
            'You requested a password reset for your Proti-Binimoy account.',
            '',
            'Use the link below to reset your password (valid for 15 minutes):',
            resetUrl,
            '',
            'If you did not request this, you can ignore this email.'
        ].join('\n');

        const html = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #047857;">Reset your Proti-Binimoy password</h2>
            <p>You requested a password reset for your account.</p>
            <p>This link is valid for 15 minutes.</p>
            <p>
              <a href="${resetUrl}" style="display:inline-block;padding:10px 16px;background:#10b981;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;">
                Reset Password
              </a>
            </p>
            <p style="word-break: break-all;">${resetUrl}</p>
            <p>If you did not request this, you can ignore this email.</p>
          </div>
        `;

        try {
            await transporter.sendMail({
                from: `Proti-Binimoy <${process.env.EMAIL_USER}>`,
                to: normalizedEmail,
                subject: 'Reset your Proti-Binimoy password',
                text,
                html
            });
        } catch (mailError) {
            console.error('FORGOT_PASSWORD_MAIL_ERROR:', mailError);
        }

        return res.status(200).json(FORGOT_PASSWORD_RESPONSE);
    } catch (err) {
        console.error('FORGOT_PASSWORD_ERROR:', err);
        return res.status(200).json(FORGOT_PASSWORD_RESPONSE);
    }
});

// @route   POST api/auth/reset-password
router.post('/reset-password', generalLimiter, async (req, res) => {
    try {
        const { token, email, newPassword } = req.body || {};

        if (!isNonEmptyString(token) || !isNonEmptyString(email) || !isNonEmptyString(newPassword)) {
            return res.status(400).json({ msg: 'Token, email, and new password are required.' });
        }

        if (newPassword.trim().length < 8) {
            return res.status(400).json({ msg: 'Password must be at least 8 characters long.' });
        }

        const normalizedEmail = normalizeEmail(email);
        if (!isValidEmail(normalizedEmail)) {
            return res.status(400).json({ msg: 'Please provide a valid email address.' });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            email: normalizedEmail,
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ msg: 'Reset link is invalid or has expired.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return res.status(200).json({ msg: 'Password reset successful. You can now sign in.' });
    } catch (err) {
        console.error('RESET_PASSWORD_ERROR:', err);
        return res.status(500).json({ msg: 'Server error' });
    }
});

// @route   POST api/auth/refresh-token
router.post('/refresh-token', async (req, res) => {
    const { token } = req.body || {};

    if (!isNonEmptyString(token)) {
        return res.status(400).json({ msg: 'Token required.' });
    }

    if (!process.env.JWT_SECRET) {
        return res.status(500).json({ msg: 'Server configuration error' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const newToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        return res.status(200).json({ token: newToken });
    } catch (err) {
        return res.status(401).json({ msg: 'Invalid or expired token.' });
    }
});

// @route   GET api/auth/google
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// @route   GET api/auth/google/callback
router.get('/google/callback', (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user, info) => {
        if (err) {
            console.error('GOOGLE PASSPORT ERROR:', err);
            return res.status(500).json({ error: err.message });
        }

        if (!user) {
            console.error('GOOGLE USER NOT FOUND:', info);
            return res.status(401).json({ error: 'Google login failed', info });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Fixed: send token to frontend
        return res.redirect(`${process.env.FRONTEND_URL}/?token=${token}`);
    })(req, res, next);
});

module.exports = router;