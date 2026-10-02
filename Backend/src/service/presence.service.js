import { WebSocket } from "ws";

const PresenceService = () => {
    const OnlineConnections = new Map();
    

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

        if (userConnections) {
            userConnections.delete(socket);

            if (userConnections.size === 0) {
                OnlineConnections.delete(userId);
            }
        }

        console.log(`WebSocket disconnected: ${userId}`);
        SendOnlineUsers(wsServer);
    };

    return {
        UserConnected,
        UserDisconnected,
    };
};

export default PresenceService;
