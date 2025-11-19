import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: String,
  date: String,
  imageUrl: String,
  description: String,
  buttonText: String,
  registrations: [
    {
      name: String,
      contact: String,
      email: String,
      registeredAt: { type: Date, default: Date.now },
    },
  ],
});

export default mongoose.model("Event", eventSchema);
