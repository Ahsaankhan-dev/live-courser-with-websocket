import mongoose from "mongoose"
import dotenv from "dotenv";

dotenv.config();

const DbConnect = async () => {
    const URI = process.env.MONGODB_URI
    console.log('DBConnect - MONGODB_URI:', URI);
    try {
        await mongoose.connect(URI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        })
        console.log("Connected to MongoDB")
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error}`)
    }
}

export default DbConnect