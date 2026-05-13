const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const DEMO_PASSWORD = 'Password123!';
const mongoOptions = {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4
};

const loadModel = (name) => {
    const modelPath = path.join(__dirname, '..', 'models', `${name}.js`);
    if (!fs.existsSync(modelPath)) return null;
    return require(modelPath);
};

const hasPaths = (Model, paths) => Boolean(
    Model &&
    Model.schema &&
    paths.every((fieldPath) => Boolean(Model.schema.path(fieldPath)))
);

const upsertBy = async (Model, filter, data) => {
    const doc = await Model.findOne(filter);
    if (doc) {
        Object.assign(doc, data);
        return doc.save();
    }
    return Model.create(data);
};

const createDate = (daysAgo) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date;
};

async function seedUsers(User) {
    if (!hasPaths(User, ['name', 'email', 'password'])) return {};

    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
    const users = [
        {
            name: 'Arafat Rahman',
            email: 'buyer@example.com',
            password: passwordHash,
            phone: '01711000001',
            nid: '19901234567000123',
            dateOfBirth: new Date('1998-04-12'),
            bio: 'Buyer interested in sustainable second-hand deals around Dhaka.',
            location: {
                address: 'Mirpur DOHS, Dhaka',
                city: 'Mirpur',
                coordinates: { lat: 23.8223, lng: 90.3654 }
            },
            profilePicture: '',
            rating: 4.7,
            totalReviews: 18,
            isVerified: true
        },
        {
            name: 'Nusrat Jahan',
            email: 'seller@example.com',
            password: passwordHash,
            phone: '01822000002',
            nid: '19881234567000456',
            dateOfBirth: new Date('1995-09-20'),
            bio: 'Verified seller listing carefully used household, study, and tech items.',
            location: {
                address: 'Road 7, Dhanmondi, Dhaka',
                city: 'Dhanmondi',
                coordinates: { lat: 23.7465, lng: 90.3760 }
            },
            profilePicture: '',
            rating: 4.9,
            totalReviews: 32,
            isVerified: true
        }
    ];

    const result = {};
    for (const user of users) {
        result[user.email] = await upsertBy(User, { email: user.email }, user);
    }
    return result;
}

async function seedListings(Listing, seller) {
    if (!hasPaths(Listing, ['title', 'description', 'price', 'category', 'condition', 'seller']) || !seller) {
        return [];
    }

    const listings = [
        {
            title: 'Dell Latitude 5420 Business Laptop',
            description: 'Core i5 11th gen, 16GB RAM, 512GB SSD. Battery backup around 4 hours. Ideal for university work and freelancing.',
            price: 45500,
            category: 'Electronics',
            condition: 'Used',
            images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80'],
            location: { city: 'Mirpur', address: 'Mirpur 10, Dhaka' },
            seller: seller._id,
            status: 'active',
            createdAt: createDate(2)
        },
        {
            title: 'Cotton Panjabi for Eid',
            description: 'Lightly used white cotton panjabi, size L. Clean stitching and comfortable for summer events.',
            price: 1200,
            category: 'Clothing',
            condition: 'Used',
            images: ['https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=900&q=80'],
            location: { city: 'Chattogram', address: 'Nasirabad, Chattogram' },
            seller: seller._id,
            status: 'active',
            createdAt: createDate(4)
        },
        {
            title: 'Solid Wood Reading Table',
            description: 'Study table with two drawers. Suitable for students, small apartments, or home office setups.',
            price: 6500,
            category: 'Home',
            condition: 'Used',
            images: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=900&q=80'],
            location: { city: 'Dhanmondi', address: 'Dhanmondi 27, Dhaka' },
            seller: seller._id,
            status: 'active',
            createdAt: createDate(6)
        },
        {
            title: 'Phoenix Mountain Bike 26 Inch',
            description: 'Reliable mountain bike with front suspension and recently serviced brakes. Good for campus or city commuting.',
            price: 18000,
            category: 'Sports',
            condition: 'Used',
            images: ['https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=900&q=80'],
            location: { city: 'Uttara', address: 'Sector 11, Uttara, Dhaka' },
            seller: seller._id,
            status: 'active',
            createdAt: createDate(8)
        },
        {
            title: 'HSC Science Books Bundle',
            description: 'Physics, Chemistry, Biology, and Math guide books for HSC students. Some pencil notes inside.',
            price: 1800,
            category: 'Books',
            condition: 'Used',
            images: ['https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=900&q=80'],
            location: { city: 'Sylhet', address: 'Zindabazar, Sylhet' },
            seller: seller._id,
            status: 'active',
            createdAt: createDate(10)
        },
        {
            title: 'Honda Dio Scooter 2019',
            description: 'Well-maintained scooter with valid papers. Used for office commuting in Rajshahi city.',
            price: 112000,
            category: 'Vehicles',
            condition: 'Used',
            images: ['https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=900&q=80'],
            location: { city: 'Rajshahi', address: 'Shaheb Bazar, Rajshahi' },
            seller: seller._id,
            status: 'active',
            createdAt: createDate(12)
        },
        {
            title: 'Casio Scientific Calculator FX-991EX',
            description: 'Original Casio calculator in working condition. Useful for school, college, and admission test preparation.',
            price: 900,
            category: 'Other',
            condition: 'Used',
            images: ['https://images.unsplash.com/photo-1564473185935-58113cba1e80?auto=format&fit=crop&w=900&q=80'],
            location: { city: 'Khulna', address: 'Khalishpur, Khulna' },
            seller: seller._id,
            status: 'active',
            createdAt: createDate(14)
        }
    ];

    const result = [];
    for (const listing of listings) {
        result.push(await upsertBy(
            Listing,
            { title: listing.title, seller: seller._id },
            listing
        ));
    }
    return result;
}

async function seedOffers(Offer, listings, buyer, seller) {
    if (!hasPaths(Offer, ['listing', 'fromUser', 'toUser', 'offerType', 'status']) || !buyer || !seller) {
        return [];
    }

    const byCategory = new Map(listings.map((listing) => [listing.category, listing]));
    const offers = [
        {
            listing: byCategory.get('Electronics')?._id,
            fromUser: buyer._id,
            toUser: seller._id,
            offerType: 'cash',
            cashAmount: 42000,
            message: 'I can collect from Mirpur this week if the laptop battery condition is as described.',
            status: 'pending'
        },
        {
            listing: byCategory.get('Home')?._id,
            fromUser: buyer._id,
            toUser: seller._id,
            offerType: 'cash+barter',
            cashAmount: 3500,
            barterItem: 'Used office chair with adjustable height',
            message: 'I can add cash with my office chair for the reading table.',
            status: 'accepted'
        },
        {
            listing: byCategory.get('Sports')?._id,
            fromUser: buyer._id,
            toUser: seller._id,
            offerType: 'barter',
            barterItem: 'Cricket kit with bat, pads, and gloves',
            message: 'Would you trade the bike for my cricket kit?',
            status: 'declined'
        },
        {
            listing: byCategory.get('Books')?._id,
            fromUser: buyer._id,
            toUser: seller._id,
            offerType: 'cash',
            cashAmount: 1800,
            message: 'I want the full HSC science bundle for my younger brother.',
            status: 'completed'
        }
    ].filter((offer) => offer.listing);

    const result = [];
    for (const offer of offers) {
        result.push(await upsertBy(
            Offer,
            { listing: offer.listing, fromUser: offer.fromUser, toUser: offer.toUser },
            offer
        ));
    }
    return result;
}

async function seedMessages(Message, offers, buyer, seller) {
    if (!hasPaths(Message, ['offer', 'sender', 'receiver', 'body']) || !buyer || !seller) {
        return [];
    }

    const acceptedOffer = offers.find((offer) => offer.status === 'accepted') || offers[0];
    const completedOffer = offers.find((offer) => offer.status === 'completed') || offers[0];
    const messages = [
        {
            offer: acceptedOffer?._id,
            sender: buyer._id,
            receiver: seller._id,
            body: 'Assalamu alaikum, is the reading table still available?',
            read: true
        },
        {
            offer: acceptedOffer?._id,
            sender: seller._id,
            receiver: buyer._id,
            body: 'Yes, it is available. You can check it in Dhanmondi after 6 PM.',
            read: true
        },
        {
            offer: completedOffer?._id,
            sender: buyer._id,
            receiver: seller._id,
            body: 'Payment completed. I will pick up the books tomorrow from Sylhet city.',
            read: false
        }
    ].filter((message) => message.offer);

    const result = [];
    for (const message of messages) {
        result.push(await upsertBy(
            Message,
            { offer: message.offer, sender: message.sender, body: message.body },
            message
        ));
    }
    return result;
}

async function seedPayments(Payment, offers, listings, buyer, seller) {
    if (!hasPaths(Payment, ['offer', 'listing', 'buyer', 'seller', 'amount']) || !buyer || !seller) {
        return [];
    }

    const completedOffer = offers.find((offer) => offer.status === 'completed');
    const completedListing = listings.find((listing) => String(listing._id) === String(completedOffer?.listing));
    if (!completedOffer || !completedListing) return [];

    const payment = {
        offer: completedOffer._id,
        listing: completedListing._id,
        buyer: buyer._id,
        seller: seller._id,
        amount: completedOffer.cashAmount || completedListing.price,
        currency: 'BDT',
        transactionId: 'PB-DEMO-SSL-0001',
        sslSessionKey: 'demo-session-key',
        status: 'success',
        sslResponse: {
            status: 'VALID',
            card_type: 'VISA-Demo',
            store_amount: completedOffer.cashAmount || completedListing.price,
            tran_date: new Date().toISOString()
        }
    };

    return [
        await upsertBy(Payment, { transactionId: payment.transactionId }, payment)
    ];
}

async function run() {
    if (process.env.NODE_ENV === 'production') {
        console.error('Refusing to run seed script when NODE_ENV=production.');
        process.exit(1);
    }

    if (!process.env.MONGO_URI) {
        console.error('MONGO_URI is required. Copy .env.example to .env and set your MongoDB connection string.');
        process.exit(1);
    }

    const User = loadModel('User');
    const Listing = loadModel('Listing');
    const Offer = loadModel('Offer');
    const Message = loadModel('Message');
    const Payment = loadModel('Payment');

    try {
        await mongoose.connect(process.env.MONGO_URI, mongoOptions);
        console.log('Connected to MongoDB.');

        const users = await seedUsers(User);
        const buyer = users['buyer@example.com'];
        const seller = users['seller@example.com'];
        const listings = await seedListings(Listing, seller);
        const offers = await seedOffers(Offer, listings, buyer, seller);
        const messages = await seedMessages(Message, offers, buyer, seller);
        const payments = await seedPayments(Payment, offers, listings, buyer, seller);

        if (buyer && listings.length > 0 && hasPaths(User, ['savedListings'])) {
            buyer.savedListings = listings.slice(0, 3).map((listing) => listing._id);
            await buyer.save();
        }

        console.log('Seed complete.');
        console.log(`Users: ${Object.keys(users).length}`);
        console.log(`Listings: ${listings.length}`);
        console.log(`Offers: ${offers.length}`);
        console.log(`Messages: ${messages.length}`);
        console.log(`Payments: ${payments.length}`);
        console.log(`Demo buyer: buyer@example.com / ${DEMO_PASSWORD}`);
        console.log(`Demo seller: seller@example.com / ${DEMO_PASSWORD}`);
    } catch (err) {
        console.error('Seed failed.');
        console.error(err);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    }
}

run();
