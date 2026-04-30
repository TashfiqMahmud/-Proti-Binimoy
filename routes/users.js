const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

// @route   GET /api/users/:id
// @desc    Get public profile of a user
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(404).json({ msg: 'User not found.' });
        }

        const user = await User.findById(req.params.id)
            .select('-password -savedListings -isVerified');

        if (!user) {
            return res.status(404).json({ msg: 'User not found.' });
        }

        return res.json(user);
    } catch (err) {
        console.error('GET_USER_ERROR:', err);
        return res.status(500).json({ msg: 'Server error' });
    }
});

// @route   PUT /api/users/profile
// @desc    Update current user's profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
    try {
        const { name, phone, bio, location, profilePicture } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found.' });
        }

        if (name && name.trim().length >= 3) user.name = name.trim();
        if (phone) user.phone = phone.trim();
        if (bio !== undefined) user.bio = bio.trim();
        if (profilePicture !== undefined) user.profilePicture = profilePicture.trim();
        if (location) {
            user.location = {
                address: location.address || user.location?.address,
                city: location.city || user.location?.city,
                coordinates: {
                    lat: location.coordinates?.lat ?? user.location?.coordinates?.lat,
                    lng: location.coordinates?.lng ?? user.location?.coordinates?.lng
                }
            };
        }

        await user.save();
        const updatedUser = await User.findById(req.user.id).select('-password');
        return res.json({ msg: 'Profile updated successfully!', user: updatedUser });
    } catch (err) {
        console.error('UPDATE_PROFILE_ERROR:', err);
        return res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;