import app from "./app.js";
import DbConnect from "./config/DBConnect.js";
import dotenv from "dotenv";
import path from "path";
import { WebSocketServer } from "ws";
import VerifyWebSocketClient from "./middleware/websocket.middleware.js";
import PresenceService from "./service/presence.service.js";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const Port = process.env.PORT || 5000;
const Presence = PresenceService();

const ServerStart = async () => {
    await DbConnect();


    const server = app.listen(Port, () => {
        console.log(`Server is running on port ${Port}`);
    });

    const wsServer = new WebSocketServer({
        server,
        verifyClient: VerifyWebSocketClient,
    });

    wsServer.on("connection", (socket, request) => {
        const userId = request.authUserId;
        const userName = request.authUserName;
        console.log("connected userId:", userId, typeof userId);
        socket.connectionId = crypto.randomUUID();   // har tab/socket ki apni id

        Presence.UserConnected(wsServer, socket, userId);

        socket.on("message", (message) => {
            let data;
            try {
                data = JSON.parse(message.toString());
            } catch {
                return;   // ghalat JSON ignore kawalo da para
            }

            if (data.type === "cursor") {
                const X = Number(data.X);
                const Y = Number(data.Y);
                if (!Number.isFinite(X) || !Number.isFinite(Y)) return;

                Presence.BroadcastCursor(wsServer, socket, {
                    id: socket.connectionId,
                    userId,
                    name: userName,
                    X,
                    Y,
                });
                return;
            }

            Presence.BroadcastMessage(wsServer, userId, message.toString());
        });

        socket.on("close", () => {
            Presence.UserDisconnected(wsServer, socket, userId);
        });

        socket.on("error", (error) => {
            console.error(`WebSocket error for ${userId}:`, error.message);
        });
    });
};

ServerStart().catch((error) => {
    console.error("Error starting server:", error.message);
});
