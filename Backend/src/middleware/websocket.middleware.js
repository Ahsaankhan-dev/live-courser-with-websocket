import JwtUtils from "../utils/jwt.utils.js";
import User from "../models/user.model.js";

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

        User.findById(user.userId)
            .select("name")
            .lean()
            .then((authenticatedUser) => {
                if (!authenticatedUser) {
                    return done(false, 401, "User not found");
                }

                info.req.authUserId = String(user.userId);
                info.req.authUserName = authenticatedUser.name;
                done(true);
            })
            .catch((error) => {
                console.error("WebSocket user lookup failed:", error.message);
                done(false, 500, "Could not authenticate user");
            });
    } catch (error) {
        console.error("WebSocket authentication failed:", error.message);
        return done(false, 401, "Invalid or expired authentication token");
    }
};

export default VerifyWebSocketClient;
