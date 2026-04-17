const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Listing = require('../models/Listing');
const auth = require('../middleware/auth');

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;
const parsePositiveInt = (value, fallback) => {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed < 1) return fallback;
    return parsed;
};
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const isValidListingId = (id) => mongoose.Types.ObjectId.isValid(id);

// @route   GET /api/listings
// @desc    Get all active listings
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { category, condition, search, page, limit } = req.query;
        const filter = { status: 'active' };

        if (category) filter.category = category;
        if (condition) filter.condition = condition;
        if (isNonEmptyString(search)) {
            // Escape user input to avoid regex injection and pathological patterns.
            const safeSearch = escapeRegex(search.trim().slice(0, 100));
            filter.title = { $regex: safeSearch, $options: 'i' };
        }

        const pageNumber = parsePositiveInt(page, 1);
        const pageSize = Math.min(parsePositiveInt(limit, DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE);

        const listings = await Listing.find(filter)
            .populate('seller', 'name email phone profilePicture')
            .sort({ createdAt: -1 })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize);

        res.json(listings);
    } catch (err) {
        console.error('GET_LISTINGS_ERROR:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   GET /api/listings/:id
// @desc    Get single listing by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        if (!isValidListingId(req.params.id)) {
            return res.status(400).json({ msg: 'Invalid listing id' });
        }

        const listing = await Listing.findById(req.params.id)
            .populate('seller', 'name email phone profilePicture location');

        if (!listing || listing.status === 'deleted') {
            return res.status(404).json({ msg: 'Listing not found' });
        }

        res.json(listing);
    } catch (err) {
        console.error('GET_LISTING_ERROR:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   POST /api/listings
// @desc    Create a new listing
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { title, description, price, category, condition, images, location } = req.body || {};

        if (
            !isNonEmptyString(title) ||
            !isNonEmptyString(description) ||
            price === undefined ||
            price === null ||
            !isNonEmptyString(category) ||
            !isNonEmptyString(condition)
        ) {
            return res.status(400).json({ msg: 'Please fill in all required fields' });
        }

        const numericPrice = Number(price);
        if (!Number.isFinite(numericPrice) || numericPrice < 0) {
            return res.status(400).json({ msg: 'Price must be a valid non-negative number' });
        }

        const listing = new Listing({
            title: title.trim(),
            description: description.trim(),
            price: numericPrice,
            category,
            condition,
            images: images || [],
            location: location || {},
            seller: req.user.id
        });

        await listing.save();
        res.status(201).json({ msg: 'Listing created successfully!', listing });
    } catch (err) {
        console.error('CREATE_LISTING_ERROR:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   PUT /api/listings/:id
// @desc    Update a listing
// @access  Private (only the seller)
router.put('/:id', auth, async (req, res) => {
    try {
        if (!isValidListingId(req.params.id)) {
            return res.status(400).json({ msg: 'Invalid listing id' });
        }

        const listing = await Listing.findById(req.params.id);

        if (!listing || listing.status === 'deleted') {
            return res.status(404).json({ msg: 'Listing not found' });
        }

        if (listing.seller.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized to update this listing' });
        }

        const { title, description, price, category, condition, images, location, status } = req.body;

        if (title !== undefined) {
            if (!isNonEmptyString(title)) {
                return res.status(400).json({ msg: 'Title cannot be empty' });
            }
            listing.title = title.trim();
        }

        if (description !== undefined) {
            if (!isNonEmptyString(description)) {
                return res.status(400).json({ msg: 'Description cannot be empty' });
            }
            listing.description = description.trim();
        }

        if (price !== undefined) {
            const numericPrice = Number(price);
            if (!Number.isFinite(numericPrice) || numericPrice < 0) {
                return res.status(400).json({ msg: 'Price must be a valid non-negative number' });
            }
            listing.price = numericPrice;
        }

        if (category !== undefined) listing.category = category;
        if (condition !== undefined) listing.condition = condition;
        if (images !== undefined) listing.images = images;
        if (location !== undefined) listing.location = location;
        if (status !== undefined) listing.status = status;

        await listing.save();
        res.json({ msg: 'Listing updated successfully!', listing });
    } catch (err) {
        console.error('UPDATE_LISTING_ERROR:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   DELETE /api/listings/:id
// @desc    Delete a listing
// @access  Private (only the seller)
router.delete('/:id', auth, async (req, res) => {
    try {
        if (!isValidListingId(req.params.id)) {
            return res.status(400).json({ msg: 'Invalid listing id' });
        }

        const listing = await Listing.findById(req.params.id);

        if (!listing || listing.status === 'deleted') {
            return res.status(404).json({ msg: 'Listing not found' });
        }

        if (listing.seller.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized to delete this listing' });
        }

        listing.status = 'deleted';
        await listing.save();
        res.json({ msg: 'Listing deleted successfully!' });
    } catch (err) {
        console.error('DELETE_LISTING_ERROR:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
