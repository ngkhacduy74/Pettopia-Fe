import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  clerkId: { type: String, unique: true },
  email: String,
  name: String,
  role: { type: String, default: "user" }, // admin hoặc user
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);