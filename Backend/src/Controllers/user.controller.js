import UserService from "../service/user.service.js"
import UserUtils from "../utils/user.utilas.js";
import UserValidators from "../validators/user.validators.js";

const { checkid, ValidateName } = UserValidators();


const AuthController = () => {
    const RegisterUser = async (req, res) => {
        const { name, email, password } = req.body
        try {
            const UserData = await UserService().createUser(name, email, password)

            // Check if it's an error response (no data property or StatusCode >= 400)
            if (!UserData.data || UserData.StatusCode >= 400) {
                return UserUtils().ErrorResponse(res, UserData.StatusCode || 500, UserData.message)
            }

            // Set HttpOnly cookies
            res.cookie('authToken', UserData.data.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 15 * 60 * 1000 // 15 minutes
            })

            res.cookie('refreshToken', UserData.data.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            })

            return UserUtils().SuccessResponse(res, UserData.StatusCode, UserData.message, {
                user: UserData.data.user,
                accessToken: UserData.data.accessToken,
                expiresIn: UserData.data.expiresIn
            })
        } catch (error) {
            console.error("Error creating user:", error)
            return UserUtils().ErrorResponse(res, 500, "Internal server error", error.message)
        }
    }

    const LoginUser = async (req, res) => {
        const { email, password } = req.body
        try {
            const UserData = await UserService().loginUser(email, password)

            // Check if it's an error response (no data property or StatusCode >= 400)
            if (!UserData.data || UserData.StatusCode >= 400) {
                return UserUtils().ErrorResponse(res, UserData.StatusCode || 500, UserData.message)
            }

            // Set HttpOnly cookies
            res.cookie('authToken', UserData.data.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 15 * 60 * 1000 // 15 minutes
            })

            res.cookie('refreshToken', UserData.data.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            })

            return UserUtils().SuccessResponse(res, UserData.StatusCode, UserData.message, {
                user: UserData.data.user,
                accessToken: UserData.data.accessToken,
                expiresIn: UserData.data.expiresIn
            })
        } catch (error) {
            console.error("Error logging in user:", error)
            return UserUtils().ErrorResponse(res, 500, "Internal server error", error.message)
        }
    }

    const LogoutUser = async (req, res) => {
        try {
            const refreshToken = req.cookies?.refreshToken
            const userId = req.user?.userId

            if (userId && refreshToken) {
                await UserService().logoutUser(userId, refreshToken)
            }

            // Clear cookies
            res.clearCookie('authToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            })

            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            })

            return UserUtils().SuccessResponse(res, 200, "Logged out successfully")
        } catch (error) {
            console.error("Error logging out user:", error)
            return UserUtils().ErrorResponse(res, 500, "Internal server error", error.message)
        }
    }

    const RefreshToken = async (req, res) => {
        try {
            const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken

            if (!refreshToken) {
                return UserUtils().ErrorResponse(res, 400, "Refresh token is required")
            }

            const UserData = await UserService().refreshAccessToken(refreshToken)

            // Check if it's an error response (no data property or StatusCode >= 400)
            if (!UserData.data || UserData.StatusCode >= 400) {
                return UserUtils().ErrorResponse(res, UserData.StatusCode || 500, UserData.message)
            }

            // Set new access token cookie
            res.cookie('authToken', UserData.data.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 15 * 60 * 1000 // 15 minutes
            })

            return UserUtils().SuccessResponse(res, UserData.StatusCode, UserData.message, {
                accessToken: UserData.data.accessToken,
                expiresIn: UserData.data.expiresIn
            })
        } catch (error) {
            console.error("Error refreshing token:", error)
            return UserUtils().ErrorResponse(res, 500, "Internal server error", error.message)
        }
    }

    const GetCurrentUser = async (req, res) => {
        try {
            const userId = req.user?.userId

            if (!userId) {
                return UserUtils().ErrorResponse(res, 401, "Unauthorized")
            }

            const user = await UserService().userById(userId)
            if (user.StatusCode && user.StatusCode !== 200) {
                return UserUtils().ErrorResponse(res, user.StatusCode, user.message)
            }

            return UserUtils().SuccessResponse(res, 200, "User retrieved successfully", UserUtils().UserDTO(user))
        } catch (error) {
            console.error("Error retrieving user:", error)
            return UserUtils().ErrorResponse(res, 500, "Internal server error", error.message)
        }
    }

    const ListUsers = async (req, res) => {
        try {
            const users = await UserService().getUsers()
            const otherUsers = users
                .filter((user) => user._id.toString() !== req.user?.userId)
                .map((user) => ({ id: user._id, name: user.name }))

            return UserUtils().SuccessResponse(res, 200, "Users retrieved successfully", otherUsers)
        } catch (error) {
            console.error("Error retrieving users:", error)
            return UserUtils().ErrorResponse(res, 500, "Internal server error", error.message)
        }
    }

    const ChangeName = async (req, res) => {
        const { id } = req.params
        const { name } = req.body
        try {
            const checkid = await checkid(id);
            if (checkid) return UserUtils().ErrorResponse(res, checkid.StatusCode, checkid.message);

            const validatName = await ValidateName(name);
            if (validatName) return UserUtils().ErrorResponse(res, validatName.StatusCode, validatName.message);

            const user = await UserService().userById(id)
            if (user.StatusCode && user.StatusCode !== 200) {
                return UserUtils().ErrorResponse(res, user.StatusCode, user.message)
            }

            user.name = name
            await user.save()
            return UserUtils().SuccessResponse(res, 200, "User name updated successfully", UserUtils().UserDTO(user))
        } catch (error) {
            console.error("Error updating user name:", error)
            return UserUtils().ErrorResponse(res, 500, "Internal server error", error.message)
        }
    }

    const ChangePassword = async (req, res) => {
        const { id } = req.params
        const { password } = req.body
        try {
            const checkid = await checkid(id);
            if (checkid) return UserUtils().ErrorResponse(res, checkid.StatusCode, checkid.message);

            const user = await UserService().userById(id)
            if (user.StatusCode && user.StatusCode !== 200) {
                return UserUtils().ErrorResponse(res, user.StatusCode, user.message)
            }

            const isPasswordValid = await UserUtils().PasswordCompare(password, user.password)
            if (isPasswordValid===false) {
                return UserUtils().ErrorResponse(res, 400, "Invalid password.")
            }

            const passwordCheck = await UserService().PasswordCheck(password);
            if (passwordCheck) return UserUtils().ErrorResponse(res, passwordCheck.StatusCode, passwordCheck.message);

            const HashPassword = await UserUtils().PasswordHashed(password)
            user.password = HashPassword
            await user.save()
            return UserUtils().SuccessResponse(res, 200, "User password updated successfully", UserUtils().UserDTO(user))
        } catch (error) {
            console.error("Error updating user password:", error)
            return UserUtils().ErrorResponse(res, 500, "Internal server error", error.message)
        }
    }

    const getUser = async (req, res) => {
        const { id } = req.params
        try {
            const checkid = await checkid(id);
            if (checkid) return UserUtils().ErrorResponse(res, checkid.StatusCode, checkid.message);

            const user = await UserService().userById(id)
            if (user.StatusCode && user.StatusCode !== 200) {
                return UserUtils().ErrorResponse(res, user.StatusCode, user.message)
            }

            return UserUtils().SuccessResponse(res, 200, "User retrieved successfully", UserUtils().UserDTO(user))
        } catch (error) {
            console.error("Error retrieving user:", error)
            return UserUtils().ErrorResponse(res, 500, "Internal server error", error.message)
        }
    }

    return {
        RegisterUser,
        LoginUser,
        LogoutUser,
        RefreshToken,
        GetCurrentUser,
        ListUsers,
        getUser,
        ChangeName,
        ChangePassword
    }
}


export default AuthController
