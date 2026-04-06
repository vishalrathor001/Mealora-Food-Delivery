import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  item: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
  rating: Number
}, { timestamps: true });

ratingSchema.index({ user: 1, item: 1 }, { unique: true });

export default mongoose.model("Rating", ratingSchema);