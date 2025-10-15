import mongoose from "mongoose";

const donationSchema = new mongoose.Schema({
  items: [String],
  other_items: String,
  donor_name: { type: String, required: true },
  donor_contact: { type: String, required: true },
  pickup: { type: String, required: true },
  other_location: String,
  createdAt: { type: Date, default: Date.now },
});

export const Donation = mongoose.model("Donation", donationSchema);
