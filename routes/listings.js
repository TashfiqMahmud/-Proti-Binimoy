const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const auth = require('../middleware/auth');

// @route   GET /api/listings
// @desc    Get all active listings
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { category, condition, search } = req.query;
        let filter = { status: 'active' };

        if (category) filter.category = category;
        if (condition) filter.condition = condition;
        if (search) filter.title = { $regex: search, $options: 'i' };

        const listings = await Listing.find(filter)
            .populate('seller', 'name email phone profilePicture')
            .sort({ createdAt: -1 });

        res.json(listings);
    } catch (err) {
        console.error('GET_LISTINGS_ERROR:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   GET /api/listings/mine
// @desc    Get current user's non-deleted listings
// @access  Private
router.get('/mine', auth, async (req, res) => {
    try {
        const listings = await Listing.find({
            seller: req.user.id,
            status: { $ne: 'deleted' }
        })
            .populate('seller', 'name email')
            .sort({ createdAt: -1 });

        res.json(listings);
    } catch (err) {
        console.error('GET_MY_LISTINGS_ERROR:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   GET /api/listings/:id
// @desc    Get single listing by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
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
        const { title, description, price, category, condition, images, location } = req.body;

        if (!title || !description || !price || !category || !condition) {
            return res.status(400).json({ msg: 'Please fill in all required fields' });
        }

        const listing = new Listing({
            title: title.trim(),
            description: description.trim(),
            price,
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
        const listing = await Listing.findById(req.params.id);

        if (!listing || listing.status === 'deleted') {
            return res.status(404).json({ msg: 'Listing not found' });
        }

        if (listing.seller.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized to update this listing' });
        }

        const { title, description, price, category, condition, images, location, status } = req.body;

        if (title) listing.title = title.trim();
        if (description) listing.description = description.trim();
        if (price) listing.price = price;
        if (category) listing.category = category;
        if (condition) listing.condition = condition;
        if (images) listing.images = images;
        if (location) listing.location = location;
        if (status) listing.status = status;

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
