// models/BeneficiaryDB.js
import mongoose from "mongoose";

const beneficiarySchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: { type: String },
  address: { type: String, required: true },
  donor_name: String,
  donor_email: String,
  donor_contact: String,
  pickup: String,
  items: [String],
  other_items: String,
  images: [String],
  collectedAt: Date,
  donatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Beneficiary", beneficiarySchema);
