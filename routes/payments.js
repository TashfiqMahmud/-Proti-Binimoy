const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const SSLCommerzPayment = require('sslcommerz-lts');
const Payment = require('../models/Payment');
const Offer = require('../models/Offer');
const Listing = require('../models/Listing');
const User = require('../models/User');

const store_id = process.env.SSL_STORE_ID;
const store_passwd = process.env.SSL_STORE_PASSWORD;
const is_live = process.env.SSL_IS_LIVE === 'true';

// @route   POST /api/payments/init
// @desc    Initialize payment for an accepted offer
// @access  Private
router.post('/init', auth, async (req, res) => {
    try {
        const { offerId } = req.body;

        if (!offerId) {
            return res.status(400).json({ msg: 'offerId is required.' });
        }

        const offer = await Offer.findById(offerId)
            .populate('listing')
            .populate('fromUser')
            .populate('toUser');

        if (!offer) {
            return res.status(404).json({ msg: 'Offer not found.' });
        }

        if (offer.status !== 'accepted') {
            return res.status(400).json({ msg: 'Offer must be accepted before payment.' });
        }

        if (offer.fromUser._id.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Only the buyer can initiate payment.' });
        }

        const buyer = await User.findById(req.user.id);
        const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        const payment = new Payment({
            offer: offer._id,
            listing: offer.listing._id,
            buyer: offer.fromUser._id,
            seller: offer.toUser._id,
            amount: offer.cashAmount || offer.listing.price,
            transactionId
        });

        await payment.save();

        const data = {
            total_amount: payment.amount,
            currency: 'BDT',
            tran_id: transactionId,
            success_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payments/success`,
            fail_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payments/fail`,
            cancel_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payments/cancel`,
            ipn_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payments/ipn`,
            shipping_method: 'NO',
            product_name: offer.listing.title,
            product_category: offer.listing.category,
            product_profile: 'general',
            cus_name: buyer.name,
            cus_email: buyer.email,
            cus_add1: buyer.location?.address || 'Dhaka',
            cus_city: buyer.location?.city || 'Dhaka',
            cus_country: 'Bangladesh',
            cus_phone: buyer.phone || '01700000000',
        };

        const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
        const apiResponse = await sslcz.init(data);

        if (apiResponse?.GatewayPageURL) {
            payment.sslSessionKey = apiResponse.sessionkey;
            await payment.save();
            return res.json({ url: apiResponse.GatewayPageURL });
        } else {
            return res.status(500).json({ msg: 'Payment initialization failed.' });
        }
    } catch (err) {
        console.error('PAYMENT_INIT_ERROR:', err);
        return res.status(500).json({ msg: 'Server error' });
    }
});

// @route   POST /api/payments/success
// @desc    SSLCommerz success callback
// @access  Public
router.post('/success', async (req, res) => {
    try {
        const { tran_id, val_id, status } = req.body;

        const payment = await Payment.findOne({ transactionId: tran_id });
        if (!payment) {
            return res.redirect(`${process.env.FRONTEND_URL}/payment/failed`);
        }

        if (status === 'VALID') {
            payment.status = 'success';
            payment.sslResponse = req.body;
            await payment.save();

            await Offer.findByIdAndUpdate(payment.offer, { status: 'completed' });
            await Listing.findByIdAndUpdate(payment.listing, { status: 'sold' });

            return res.redirect(`${process.env.FRONTEND_URL}/payment/success?tran_id=${tran_id}`);
        } else {
            payment.status = 'failed';
            await payment.save();
            return res.redirect(`${process.env.FRONTEND_URL}/payment/failed`);
        }
    } catch (err) {
        console.error('PAYMENT_SUCCESS_ERROR:', err);
        return res.redirect(`${process.env.FRONTEND_URL}/payment/failed`);
    }
});

// @route   POST /api/payments/fail
// @desc    SSLCommerz fail callback
// @access  Public
router.post('/fail', async (req, res) => {
    try {
        const { tran_id } = req.body;
        const payment = await Payment.findOne({ transactionId: tran_id });
        if (payment) {
            payment.status = 'failed';
            payment.sslResponse = req.body;
            await payment.save();
        }
        return res.redirect(`${process.env.FRONTEND_URL}/payment/failed`);
    } catch (err) {
        console.error('PAYMENT_FAIL_ERROR:', err);
        return res.redirect(`${process.env.FRONTEND_URL}/payment/failed`);
    }
});

// @route   POST /api/payments/cancel
// @desc    SSLCommerz cancel callback
// @access  Public
router.post('/cancel', async (req, res) => {
    try {
        const { tran_id } = req.body;
        const payment = await Payment.findOne({ transactionId: tran_id });
        if (payment) {
            payment.status = 'cancelled';
            payment.sslResponse = req.body;
            await payment.save();
        }
        return res.redirect(`${process.env.FRONTEND_URL}/payment/cancelled`);
    } catch (err) {
        console.error('PAYMENT_CANCEL_ERROR:', err);
        return res.redirect(`${process.env.FRONTEND_URL}/payment/cancelled`);
    }
});

// @route   POST /api/payments/ipn
// @desc    SSLCommerz IPN callback
// @access  Public
router.post('/ipn', async (req, res) => {
    try {
        const { tran_id, status } = req.body;
        const payment = await Payment.findOne({ transactionId: tran_id });
        if (payment && status === 'VALID') {
            payment.status = 'success';
            payment.sslResponse = req.body;
            await payment.save();
        }
        return res.status(200).json({ msg: 'IPN received.' });
    } catch (err) {
        console.error('PAYMENT_IPN_ERROR:', err);
        return res.status(500).json({ msg: 'Server error' });
    }
});

// @route   GET /api/payments/my
// @desc    Get current user's payments
// @access  Private
router.get('/my', auth, async (req, res) => {
    try {
        const payments = await Payment.find({
            $or: [{ buyer: req.user.id }, { seller: req.user.id }]
        })
            .populate('listing', 'title price images')
            .populate('buyer', 'name email')
            .populate('seller', 'name email')
            .sort({ createdAt: -1 });

        return res.json(payments);
    } catch (err) {
        console.error('GET_MY_PAYMENTS_ERROR:', err);
        return res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;