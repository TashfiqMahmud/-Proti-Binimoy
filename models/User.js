const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String },
  googleId: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  phone: { type: String, trim: true },
  nid: { type: String, trim: true },
  dateOfBirth: { type: Date },
  passportNumber: { type: String, trim: true },
  bio: { type: String, default: "" },
  location: {
    address: { type: String },
    city: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  profilePicture: { type: String, default: "" },

  // Marketplace fields
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  savedListings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }],

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
