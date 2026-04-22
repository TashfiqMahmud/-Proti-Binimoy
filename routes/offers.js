const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const auth = require('../middleware/auth');
const Listing = require('../models/Listing');
const Offer = require('../models/Offer');

const OFFER_TYPES = new Set(['cash', 'barter', 'cash+barter']);
const STATUS_UPDATES = new Set(['accepted', 'declined', 'cancelled', 'completed']);
const LEGAL_TRANSITIONS = {
    pending: new Set(['accepted', 'declined', 'cancelled']),
    accepted: new Set(['completed', 'cancelled'])
};

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;
const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

router.use(auth);

// @route   POST /api/offers
// @desc    Create a new offer
// @access  Private
router.post('/', async (req, res) => {
    try {
        const { listingId, offerType, cashAmount, barterItem, message } = req.body || {};

        if (!listingId) {
            return res.status(400).json({ msg: 'listingId is required.' });
        }

        if (!OFFER_TYPES.has(offerType)) {
            return res.status(400).json({ msg: 'Invalid offer type.' });
        }

        if (!isValidObjectId(listingId)) {
            return res.status(400).json({ msg: 'Invalid listing id.' });
        }

        const needsCash = offerType === 'cash' || offerType === 'cash+barter';
        const needsBarter = offerType === 'barter' || offerType === 'cash+barter';

        let normalizedCashAmount;
        if (needsCash) {
            normalizedCashAmount = Number(cashAmount);
            if (!Number.isFinite(normalizedCashAmount) || normalizedCashAmount < 0) {
                return res.status(400).json({ msg: 'cashAmount must be 0 or more.' });
            }
        }

        if (needsBarter && !isNonEmptyString(barterItem)) {
            return res.status(400).json({ msg: 'barterItem is required for this offer type.' });
        }

        const listing = await Listing.findById(listingId);
        if (!listing || listing.status !== 'active') {
            return res.status(400).json({ msg: 'Listing is not available.' });
        }

        if (listing.seller.toString() === req.user.id) {
            return res.status(400).json({ msg: "You can't make an offer on your own listing." });
        }

        const existingPendingOffer = await Offer.findOne({
            listing: listingId,
            fromUser: req.user.id,
            status: 'pending'
        });
        if (existingPendingOffer) {
            return res.status(409).json({ msg: 'You already have a pending offer on this listing.' });
        }

        const offer = new Offer({
            listing: listing._id,
            fromUser: req.user.id,
            toUser: listing.seller,
            offerType,
            cashAmount: needsCash ? normalizedCashAmount : undefined,
            barterItem: needsBarter ? barterItem.trim() : undefined,
            message: isNonEmptyString(message) ? message.trim() : ''
        });

        await offer.save();
        return res.status(201).json({ msg: 'Offer sent!', offer });
    } catch (err) {
        console.error('CREATE_OFFER_ERROR:', err);
        return res.status(500).json({ msg: 'Server error' });
    }
});

// @route   GET /api/offers/received
// @desc    Get offers received by current user
// @access  Private
router.get('/received', async (req, res) => {
    try {
        const offers = await Offer.find({ toUser: req.user.id })
            .sort({ createdAt: -1 })
            .populate('listing', 'title price images')
            .populate('fromUser', 'name phone profilePicture');

        return res.json(offers);
    } catch (err) {
        console.error('GET_RECEIVED_OFFERS_ERROR:', err);
        return res.status(500).json({ msg: 'Server error' });
    }
});

// @route   GET /api/offers/sent
// @desc    Get offers sent by current user
// @access  Private
router.get('/sent', async (req, res) => {
    try {
        const offers = await Offer.find({ fromUser: req.user.id })
            .sort({ createdAt: -1 })
            .populate('listing', 'title price images')
            .populate('toUser', 'name phone profilePicture');

        return res.json(offers);
    } catch (err) {
        console.error('GET_SENT_OFFERS_ERROR:', err);
        return res.status(500).json({ msg: 'Server error' });
    }
});

// @route   GET /api/offers/:id
// @desc    Get single offer if current user is part of it
// @access  Private
router.get('/:id', async (req, res) => {
    try {
        const offerId = req.params.id;
        if (!isValidObjectId(offerId)) {
            return res.status(404).json({ msg: 'Offer not found.' });
        }

        const offer = await Offer.findById(offerId)
            .populate('listing', 'title price images')
            .populate('fromUser', 'name profilePicture')
            .populate('toUser', 'name profilePicture');

        if (!offer) {
            return res.status(404).json({ msg: 'Offer not found.' });
        }

        const isFromUser = offer.fromUser?._id
            ? offer.fromUser._id.toString() === req.user.id
            : offer.fromUser.toString() === req.user.id;
        const isToUser = offer.toUser?._id
            ? offer.toUser._id.toString() === req.user.id
            : offer.toUser.toString() === req.user.id;

        if (!isFromUser && !isToUser) {
            return res.status(403).json({ msg: 'Not authorized to view this offer.' });
        }

        return res.status(200).json({ offer });
    } catch (err) {
        console.error('GET_OFFER_ERROR:', err);
        return res.status(500).json({ msg: 'Server error' });
    }
});

// @route   PUT /api/offers/:id/status
// @desc    Update offer status with guarded transitions
// @access  Private
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body || {};
        const offerId = req.params.id;

        if (!STATUS_UPDATES.has(status)) {
            return res.status(400).json({ msg: 'Invalid status value.' });
        }

        if (!isValidObjectId(offerId)) {
            return res.status(404).json({ msg: 'Offer not found.' });
        }

        const offer = await Offer.findById(offerId);
        if (!offer) {
            return res.status(404).json({ msg: 'Offer not found.' });
        }

        const isFromUser = offer.fromUser.toString() === req.user.id;
        const isToUser = offer.toUser.toString() === req.user.id;

        if ((status === 'accepted' || status === 'declined') && !isToUser) {
            return res.status(403).json({ msg: 'Not authorized to update this offer.' });
        }

        if (status === 'cancelled' && !isFromUser) {
            return res.status(403).json({ msg: 'Not authorized to update this offer.' });
        }

        if (status === 'completed' && !isFromUser && !isToUser) {
            return res.status(403).json({ msg: 'Not authorized to update this offer.' });
        }

        const allowedTransitions = LEGAL_TRANSITIONS[offer.status];
        if (!allowedTransitions || !allowedTransitions.has(status)) {
            return res.status(400).json({ msg: 'Invalid status transition.' });
        }

        offer.status = status;
        if (status === 'accepted') {
            await Listing.findByIdAndUpdate(offer.listing, { status: 'sold' });
        }

        await offer.save();
        return res.status(200).json({ msg: 'Offer updated.', offer });
    } catch (err) {
        console.error('UPDATE_OFFER_STATUS_ERROR:', err);
        return res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
