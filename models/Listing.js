const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: {
        type: String,
        required: true,
        enum: ['Electronics', 'Clothing', 'Home', 'Sports', 'Books', 'Vehicles', 'Other']
    },
    condition: {
        type: String,
        required: true,
        enum: ['New', 'Used']
    },
    images: [{ type: String }],
    location: {
        city: { type: String },
        address: { type: String }
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'sold', 'deleted'],
        default: 'active'
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Listing', listingSchema);
