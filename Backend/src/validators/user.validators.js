import { BuildConflict } from "../utils/user.utilas.js";
import mongoose from "mongoose";


const UserValidators = () => {
    const ValidateInput = (name, email, password) => {

        if (!name || !email || !password) {
            return BuildConflict(400, "name, email and password are required.")
        }
        return null;
    }
    const Validatepassword = (password) => {
        if (!password) {
            return BuildConflict(400, "password is required.")
        }
        return null;
    }
    const ValidateEmail = (email) => {
        if (!email) {
            return BuildConflict(400, "email is required.")
        }
        return null;
    }
    const ValidateName = (name) => {
        if (!name) {
            return BuildConflict(400, "name is required.")
        }
        return null;
    }
    const ValidateId = (id) => {
        if (!id) {
            return BuildConflict(400, "id is required.")
        }
        return null;
    }

    const PasswordCheck = (password) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return BuildConflict(400, "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
        }
        return null;
    }
    const EmailCheck = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return BuildConflict(400, "Invalid email format.");
        }
        return null;
    }

    const checkid = (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return BuildConflict(400, "Invalid user id.")
        }
        return null;
    }

    return{
        ValidateInput,
        Validatepassword,
        ValidateEmail,
        ValidateName,
        PasswordCheck,
        EmailCheck,
        ValidateId,
        checkid
    }

}


export default UserValidators