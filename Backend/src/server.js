import app from "./app.js";
import DbConnect from "./config/DBConnect.js";
import dotenv from "dotenv";
import path from "path";
import { WebSocket, WebSocketServer } from "ws";
import VerifyWebSocketClient from "./middleware/websocket.middleware.js";
import PresenceService from "./service/presence.service.js";
import RedisService from "./service/redis.service.js";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const Port = process.env.PORT || 5000;
const Presence = PresenceService();
const Redis = RedisService();

const ServerStart = async () => {
    await DbConnect();


    const server = app.listen(Port, () => {
        console.log(`Server is running on port ${Port}`);
    });

    const wsServer = new WebSocketServer({
        server,
        verifyClient: VerifyWebSocketClient,
    });

    wsServer.on("connection", async (socket, request) => {
        const userId = request.authUserId;
        const userName = request.authUserName;
        console.log("connected userId:", userId, typeof userId);
        socket.connectionId = crypto.randomUUID();   // har tab/socket ki apni id

        Presence.UserConnected(wsServer, socket, userId);

        try {
            const cursors = await Redis.GetAllCursors();
            if (socket.readyState === WebSocket.OPEN) {
                for (const cursor of cursors) {
                    if (String(cursor.userId) === String(userId)) continue;

                    socket.send(JSON.stringify({
                        type: "cursor",
                        userId: String(cursor.userId),
                        name: cursor.name,
                        X: cursor.X,
                        Y: cursor.Y,
                    }));
                }
            }
        } catch (error) {
            console.error("Redis cursor restore failed:", error.message);
        }

        socket.on("message", async (message) => {
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
                try {
                    await Redis.SaveCursor({ userId, name: userName, X, Y });
                } catch (error) {
                    console.error("Redis cursor save failed:", error.message);
                }
                return;
            }

            Presence.BroadcastMessage(wsServer, userId, message.toString());
        });

        socket.on("close", async () => {
            const lastConnection = Presence.UserDisconnected(wsServer, socket, userId);
            if (lastConnection) {
                try {
                    await Redis.RemoveCursor(userId);
                } catch (error) {
                    console.error("Redis cursor delete failed:", error.message);
                }
            }
        });

        socket.on("error", (error) => {
            console.error(`WebSocket error for ${userId}:`, error.message);
        });
    });
};

try {
    await ServerStart();
} catch (error) {
    console.error("Error starting server:", error.message);
}
