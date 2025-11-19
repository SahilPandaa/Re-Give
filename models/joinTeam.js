import mongoose from "mongoose";

const joinTeamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },

  phone: {
    type: String,
    required: true,
    trim: true,
  },

  department: {
    type: String,
    required: true,
    trim: true,
  },

  year: {
    type: String,
    required: true,
    enum: ["1", "2", "3", "4"], // Only allows valid academic years
  },

  interest: {
    type: String,
    required: true,
    enum: [
      "collection",
      "sorting",
      "distribution",
      "awareness",
      "event",
    ], // Must be one of these options
  },

  message: {
    type: String,
    required: true,
    trim: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const JoinTeam = mongoose.model("JoinTeam", joinTeamSchema);
