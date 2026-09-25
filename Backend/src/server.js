import app from "./app.js"
import DbConnect from "./config/DBConnect.js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('PORT:', process.env.PORT);

const Port = process.env.PORT || 5000

const ServerStart = async () => {
    await DbConnect();
    try {
        await app.listen(Port, () => {
            console.log(`Server is running on port ${Port}`)
        })
    } catch (error) {
        console.error(`Error starting server: ${error}`)
    }

}

ServerStart();
