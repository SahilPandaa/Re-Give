// models/Donation.js
import mongoose from "mongoose";

const donationSchema = new mongoose.Schema({
  items: {
    type: [String],
    required: true,
  },
  other_items: {
    type: String,
    trim: true,
  },
  donor_name: {
    type: String,
    required: true,
    trim: true,
  },
  donor_email: {
    type: String,
    required: true,
    match: /^[a-zA-Z0-9._%+-]+@gmail\.com$/,
  },
  donor_contact: {
    type: String,
    required: true,
    trim: true,
  },
  pickup: {
    type: String,
    required: true,
  },
  other_location: {
    type: String,
    trim: true,
  },
  // ✅ New Cloudinary-compatible field
  images: {
    type: [String], // stores Cloudinary URLs
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Donation = mongoose.model("Donation", donationSchema);
