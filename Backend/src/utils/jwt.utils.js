import jwt from "jsonwebtoken"

const JwtUtils = () => {
    const generateAccessToken = (userId) => {
        return jwt.sign(
            { userId, type: 'access' },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        )
    }

    const generateRefreshToken = (userId) => {
        return jwt.sign(
            { userId, type: 'refresh' },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        )
    }

    const verifyToken = (token, type = 'access') => {
        const secret = type === 'access'
            ? process.env.JWT_SECRET
            : process.env.JWT_REFRESH_SECRET
        return jwt.verify(token, secret)
    }

    const decodeToken = (token) => {
        return jwt.decode(token)
    }

    return {
        generateAccessToken,
        generateRefreshToken,
        verifyToken,
        decodeToken
    }
}

export default JwtUtils