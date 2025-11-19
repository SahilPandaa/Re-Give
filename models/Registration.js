import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true
  },
  name: { type: String, required: true },
  contact: { type: String, required: true },
  email: { type: String, required: true },
  registeredAt: { type: Date, default: Date.now }
});

const Registration = mongoose.model("Registration", registrationSchema);
export default Registration;
