const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        offer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Offer',
            required: true,
            index: true
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        body: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000
        },
        read: {
            type: Boolean,
            default: false,
            index: true
        }
    },
    { timestamps: true }
);

// Faster message thread fetching
messageSchema.index({ offer: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);