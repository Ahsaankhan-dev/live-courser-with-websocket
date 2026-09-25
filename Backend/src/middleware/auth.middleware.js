import JwtUtils from "../utils/jwt.utils.js";
import UserUtils from "../utils/user.utilas.js";

const authMiddleware = async (req, res, next) => {
    try {
        // Get token from cookie or Authorization header
        const token = req.cookies?.authToken
            || req.headers.authorization?.split(' ')[1]

        if (!token) {
            return UserUtils().ErrorResponse(res, 401, 'No token provided')
        }

        const decoded = JwtUtils().verifyToken(token, 'access')
        req.user = decoded
        next()
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return UserUtils().ErrorResponse(res, 401, 'Token expired')
        }
        if (error.name === 'JsonWebTokenError') {
            return UserUtils().ErrorResponse(res, 401, 'Invalid token')
        }
        return UserUtils().ErrorResponse(res, 401, 'Invalid or expired token')
    }
}

export default authMiddleware