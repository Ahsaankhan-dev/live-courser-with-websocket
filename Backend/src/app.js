import express from "express";
import dotenv from "dotenv"
import authRouter from "./Routes/auth.routes.js";
import cors from "cors"
import cookieParser from "cookie-parser"

dotenv.config();


const app = express()

app.use(express.json())
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true
}));
app.use(cookieParser());

app.use('/api/auth', authRouter)


export default app