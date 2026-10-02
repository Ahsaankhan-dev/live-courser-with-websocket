import JwtUtils from "../utils/jwt.utils.js";

const VerifyWebSocketClient = (info, done) => {
    const authCookie = info.req.headers.cookie
        ?.split(";")
        .map((cookie) => cookie.trim())
        .find((cookie) => cookie.startsWith("authToken="));

    if (!authCookie) {
        return done(false, 401, "Authentication required");
    }

    try {
        const token = decodeURIComponent(authCookie.slice("authToken=".length));
        const user = JwtUtils().verifyToken(token, "access");

        info.req.authUserId = String(user.userId);
        return done(true);
    } catch (error) {
        console.error("WebSocket authentication failed:", error.message);
        return done(false, 401, "Invalid or expired authentication token");
    }
};

export default VerifyWebSocketClient;
