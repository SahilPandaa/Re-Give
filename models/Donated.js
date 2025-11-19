// models/Donated.js
import mongoose from "mongoose";

const donatedSchema = new mongoose.Schema({
  donor_name: String,
  donor_email: String,
  donor_contact: String,
  pickup: String,
  items: [String],
  other_items: String,
  images: [String],
  collectedAt: {
    type: Date,
    default: Date.now,
  },
});

export const Donated = mongoose.model("Donated", donatedSchema);
