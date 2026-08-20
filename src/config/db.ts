import mongoose from "mongoose";

export const connectDB = async () => {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("MONGO_URI is not configured");

    mongoose.set("sanitizeFilter", true);
    const connection = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10_000,
    });
    console.log(`MongoDB connected: ${connection.connection.host}`);
    return connection;
};
