import mongoose from "mongoose";

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/pdf_platform";
  try {
    await mongoose.connect(uri);
    console.log("✅  MongoDB connected");
  } catch (err) {
    console.error("❌  MongoDB connection failed:", err.message);
    process.exit(1);
  }
};
