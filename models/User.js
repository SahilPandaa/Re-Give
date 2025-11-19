import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firebase_uid: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: { type: String },
  contact: { type: String },
  isAdmin: { type: Boolean, default: false }, // 👈 new field
}, { timestamps: true });

export default mongoose.model("User", userSchema);
