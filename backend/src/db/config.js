import mongoose from "mongoose";

const connectToDB = async () => {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log("MongoDB connected");
  } catch (error) {
    console.error("DB connection error:", error.message);

    process.exit(1);
  }
};

export default connectToDB;
