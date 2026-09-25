import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import UserValidators from "../validators/user.validators.js";
import UserUtils from "../utils/user.utilas.js";
import JwtUtils from "../utils/jwt.utils.js";

const { ValidateInput, EmailCheck, PasswordCheck } = UserValidators();


const UserService = () => {

    const userByEmail = async (email) => {
        const user = await User.findOne({ email: email.toLowerCase() })
        return user
    }

    const userById = async (id) => {
        const user = await User.findById(id)
        if (!user) {
            return UserUtils().BuildConflict(404, "User not found.")
        }
        return user
    }

    const createUser = async (name, email, password) => {
        const validationError = await ValidateInput(name, email, password);
        if (validationError) return validationError;
        const emailCheck = await EmailCheck(email);
        if (emailCheck) return emailCheck;
        const passwordCheck = await PasswordCheck(password);
        if (passwordCheck) return passwordCheck;

        const Exsist = await userByEmail(email)
        if (Exsist) {
            return UserUtils().BuildConflict(409, "User already exists.")
        }

        const HashPassword = await UserUtils().PasswordHashed(password)

        const user = await User.create({
            name,
            email,
            password: HashPassword
        })

        // Generate tokens
        const accessToken = JwtUtils().generateAccessToken(user._id)
        const refreshToken = JwtUtils().generateRefreshToken(user._id)

        // Save refresh token to database
        user.refreshTokens.push(refreshToken)
        await user.save()

        return UserUtils().BuildSuccess(201, "User created successfully.", {
            user: UserUtils().UserDTO(user),
            accessToken,
            refreshToken,
            expiresIn: '15m'
        });
    }

    const loginUser = async (email, password) => {
        if (!email || !password) {
            return UserUtils().BuildConflict(400, "email and password are required.");
        }

        const user = await userByEmail(email)
        if (!user) {
            return UserUtils().BuildConflict(404, "User not found.");
        }

        const isPasswordValid = await UserUtils().PasswordCompare(password, user.password)
        if (!isPasswordValid) {
            return UserUtils().BuildConflict(401, "Invalid password.");
        }

        // Generate tokens
        const accessToken = JwtUtils().generateAccessToken(user._id)
        const refreshToken = JwtUtils().generateRefreshToken(user._id)

        // Save refresh token to database
        user.refreshTokens.push(refreshToken)
        await user.save()

        return UserUtils().BuildSuccess(200, "User logged in successfully.", {
            user: UserUtils().UserDTO(user),
            accessToken,
            refreshToken,
            expiresIn: '15m'
        });
    }

    const logoutUser = async (userId, refreshToken) => {
        const user = await User.findById(userId)
        if (!user) {
            return UserUtils().BuildConflict(404, "User not found.")
        }

        // Remove the refresh token from user's refreshTokens array
        user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken)
        await user.save()

        return UserUtils().BuildSuccess(200, "User logged out successfully.")
    }

    const refreshAccessToken = async (refreshToken) => {
        if (!refreshToken) {
            return UserUtils().BuildConflict(400, "Refresh token is required.")
        }

        try {
            // Verify refresh token
            const decoded = JwtUtils().verifyToken(refreshToken, 'refresh')

            // Check if refresh token exists in database
            const user = await User.findById(decoded.userId)
            if (!user) {
                return UserUtils().BuildConflict(404, "User not found.")
            }

            if (!user.refreshTokens.includes(refreshToken)) {
                return UserUtils().BuildConflict(401, "Invalid refresh token.")
            }

            // Generate new access token //
            const newAccessToken = JwtUtils().generateAccessToken(user._id)

            return UserUtils().BuildSuccess(200, "Access token refreshed successfully.", {
                accessToken: newAccessToken,
                expiresIn: '15m'
            })
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return UserUtils().BuildConflict(401, "Refresh token expired. Please login again.")
            }
            if (error.name === 'JsonWebTokenError') {
                return UserUtils().BuildConflict(401, "Invalid refresh token.")
            }
            return UserUtils().BuildError(500, "Internal server error", error.message)
        }
    }

    return {
        createUser,
        loginUser,
        userByEmail,
        userById,
        logoutUser,
        refreshAccessToken
    }
}

export default UserService;