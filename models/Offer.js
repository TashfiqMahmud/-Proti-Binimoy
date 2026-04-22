const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
    {
        listing: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Listing',
            required: true,
            index: true
        },
        fromUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        toUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        offerType: {
            type: String,
            enum: ['cash', 'barter', 'cash+barter'],
            required: true,
            index: true
        },
        cashAmount: {
            type: Number,
            min: 0
        },
        barterItem: {
            type: String,
            trim: true
        },
        message: {
            type: String,
            trim: true,
            maxlength: 1200,
            default: ''
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'declined', 'cancelled', 'completed'],
            default: 'pending',
            index: true
        }
    },
    { timestamps: true }
);

offerSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('Offer', offerSchema);
