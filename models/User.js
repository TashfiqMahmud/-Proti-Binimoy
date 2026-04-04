const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true }, 
  // --- NEW FIELDS FOR TEAM COLLABORATION ---
  phone: { type: String, trim: true },
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
  // -----------------------------------------
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);