const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const auth = require('../middleware/auth');
const Offer = require('../models/Offer');
const Message = require('../models/Message');

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;
const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

router.use(auth);

// @route   POST /api/messages
// @desc    Send a message in an offer thread
// @access  Private
router.post('/', async (req, res) => {
    try {
        const { offerId, body } = req.body || {};
        const trimmedBody = typeof body === 'string' ? body.trim() : '';

        if (!isValidObjectId(offerId)) {
            return res.status(400).json({ msg: 'Invalid offer id.' });
        }

        if (!isNonEmptyString(trimmedBody)) {
            return res.status(400).json({ msg: 'Message body is required.' });
        }

        if (trimmedBody.length > 2000) {
            return res.status(400).json({ msg: 'Message body cannot exceed 2000 characters.' });
        }

        const offer = await Offer.findById(offerId);
        if (!offer) {
            return res.status(404).json({ msg: 'Offer not found.' });
        }

        const isFromUser = offer.fromUser.toString() === req.user.id;
        const isToUser = offer.toUser.toString() === req.user.id;
        if (!isFromUser && !isToUser) {
            return res.status(403).json({ msg: 'Not authorized for this offer thread.' });
        }

        if (['declined', 'cancelled', 'completed'].includes(offer.status)) {
            return res.status(400).json({ msg: 'This offer is no longer active.' });
        }

        const receiver = isFromUser ? offer.toUser : offer.fromUser;

        const message = new Message({
            offer: offer._id,
            sender: req.user.id,
            receiver,
            body: trimmedBody
        });

        await message.save();
        return res.status(201).json({ msg: 'Message sent.', message });
    } catch (err) {
        console.error('SEND_MESSAGE_ERROR:', err);
        return res.status(500).json({ msg: 'Server error' });
    }
});

// @route   GET /api/messages/unread-count
// @desc    Get unread messages count for current user
// @access  Private
router.get('/unread-count', async (req, res) => {
    try {
        const count = await Message.countDocuments({
            receiver: req.user.id,
            read: false
        });
        return res.status(200).json({ count });
    } catch (err) {
        console.error('UNREAD_COUNT_ERROR:', err);
        return res.status(500).json({ msg: 'Server error' });
    }
});

// @route   GET /api/messages/:offerId
// @desc    Get messages for an offer thread
// @access  Private
router.get('/:offerId', async (req, res) => {
    try {
        const { offerId } = req.params;
        if (!isValidObjectId(offerId)) {
            return res.status(400).json({ msg: 'Invalid offer id.' });
        }

        const offer = await Offer.findById(offerId);
        if (!offer) {
            return res.status(404).json({ msg: 'Offer not found.' });
        }

        const isFromUser = offer.fromUser.toString() === req.user.id;
        const isToUser = offer.toUser.toString() === req.user.id;
        if (!isFromUser && !isToUser) {
            return res.status(403).json({ msg: 'Not authorized for this offer thread.' });
        }

        const messages = await Message.find({ offer: offerId })
            .sort({ createdAt: 1 })
            .populate('sender', 'name profilePicture');

        await Message.updateMany(
            { offer: offerId, receiver: req.user.id, read: false },
            { $set: { read: true } }
        );

        return res.status(200).json(messages);
    } catch (err) {
        console.error('GET_MESSAGES_ERROR:', err);
        return res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;

