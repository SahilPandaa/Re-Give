// models/admin.js
import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  firebase_uid: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Admin = mongoose.model("Admin", adminSchema);
