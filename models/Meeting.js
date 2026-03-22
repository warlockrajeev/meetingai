import mongoose from "mongoose";

const MeetingSchema = new mongoose.Schema({
  transcript: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
    required: true,
  },
  keyPoints: {
    type: [String],
    default: [],
  },
  actionItems: {
    type: [String],
    default: [],
  },
  fileName: {
    type: String,
    default: "Untitled Meeting",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Meeting || mongoose.model("Meeting", MeetingSchema);
