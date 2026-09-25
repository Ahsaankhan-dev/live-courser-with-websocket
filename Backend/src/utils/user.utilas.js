import bcrypt from "bcryptjs"

const UserDTO = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email
})

const BuildConflict = (code, message) => {
    return {
        StatusCode: code,
        message: message
    }
}

const UserUtils = () => {

    const PasswordHashed = async (password) => {
        const HashPassword = await bcrypt.hash(password, 10)
        return HashPassword
    }

    const PasswordCompare = async (password, hashedPassword) => {
        const isPasswordValid = await bcrypt.compare(password, hashedPassword)
        if (!isPasswordValid) {
            return false
        }
        return isPasswordValid
    }

    const SuccessResponse = (res, code, message, data) => {
        return res.status(code).json({
            StatusCode: code,
            message: message,
            data: data
        })
    }

    const ErrorResponse = (res, code, message, error = null) => {
        const response = {
            StatusCode: code,
            message: message
        }
        if (error) {
            response.error = error
        }
        return res.status(code).json(response)
    }
    const BuildSuccess = (code, message, data) => {
        return {
            StatusCode: code,
            message: message,
            data: data
        }
    }

    const BuildError = (code, message, error) => {
        return {
            StatusCode: code,
            message: message,
            error: error
        }
    }


    return{
        PasswordHashed,
        PasswordCompare,
        SuccessResponse,
        ErrorResponse,
        BuildSuccess,
        BuildError,
        BuildConflict,
        UserDTO
    }


}


export { UserDTO, BuildConflict }
export default UserUtils