import app from "./app.js"
import DbConnect from "./config/DBConnect.js";
import dotenv from "dotenv";
import path from "path";
import {WebSocketServer} from "ws";

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('PORT:', process.env.PORT);

const Port = process.env.PORT || 5000

const wsServer = new WebSocketServer({server: app});
wsServer.on('connection', (socket) => {
    console.log('WebSocket client connected');

    socket.on('message', (message) => {
        console.log(`Received message: ${message}`);
        // Handle incoming messages from clients here
    });

    socket.on('close', () => {
        console.log('WebSocket client disconnected');
    });
});
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
