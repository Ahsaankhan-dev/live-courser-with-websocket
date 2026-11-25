import { WebSocket } from "ws";

const PresenceService = () => {
    const OnlineConnections = new Map();


    const BroadcastMessage = (wsServer, userId, MessageData) => {
        const broadcastMessage = JSON.stringify({
            type: "message",
            userId,
            message: MessageData,
        });

        wsServer.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(broadcastMessage);
            }
        });
    }


    const SendOnlineUsers = (wsServer) => {
        const message = JSON.stringify({
            type: "presence",
            onlineUserIds: [...OnlineConnections.keys()],
        });



        wsServer.clients.forEach((client) => {

            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    };

    const UserConnected = (wsServer, socket, userId) => {
        const userConnections = OnlineConnections.get(userId) || new Set();

        userConnections.add(socket);
        OnlineConnections.set(userId, userConnections);

        console.log(`WebSocket connected: ${userId}`);
        SendOnlineUsers(wsServer);
    };

    const UserDisconnected = (wsServer, socket, userId) => {
        const userConnections = OnlineConnections.get(userId);
        let lastConnection = false;

        if (userConnections) {
            userConnections.delete(socket);

            if (userConnections.size === 0) {
                OnlineConnections.delete(userId);
                lastConnection = true;

                // user ka koi tab nahi bacha, cursor hata do
                const leaveMessage = JSON.stringify({ type: "cursor-leave", userId });
                wsServer.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) client.send(leaveMessage);
                });
            }
        }

        console.log(`WebSocket disconnected: ${userId}`);
        SendOnlineUsers(wsServer);
        return lastConnection;
    };

    const BroadcastCursor = (wsServer, senderSocket, cursorData) => {
        const { userId, name, X, Y } = cursorData || {};

        if (!userId || typeof name !== "string" || !Number.isFinite(X) || !Number.isFinite(Y)) {
            return;
        }

        const message = JSON.stringify({ type: "cursor", userId: String(userId), name, X, Y });

        wsServer.clients.forEach((client) => {
            if (client !== senderSocket && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    };

    const BroadcastCursorLeave = (wsServer, id) => {
        const message = JSON.stringify({ type: "cursor-leave", id });

        wsServer.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) client.send(message);
        });
    };


    return {
        UserConnected,
        UserDisconnected,
        BroadcastMessage,
        SendOnlineUsers,
        BroadcastCursor,
        BroadcastCursorLeave,
    };
};

export default PresenceService;
