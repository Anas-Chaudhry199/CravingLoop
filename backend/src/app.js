import express from "express";
import cookieParser from "cookie-parser"
import cors from "cors"

const app = express();

app.use(cors(
    {
        origin: process.env.CORS_ORIGIN,
        credentials: true
    }
))

app.use(express.json({ limit: "16kb"}))
app.use(express.urlencoded({limit:"16kb", extended: true}))
app.use(express.static("public"))
app.use(cookieParser())

import authRouter from "./routes/auth.routes.js";
app.use("/api/v1/auth", authRouter)

import userRouter from "./routes/user.routes.js";
app.use("/api/v1/user", userRouter)

import { shopRouter } from "./routes/shop.routes.js";
app.use("/api/v1/shop", shopRouter)

import { itemRouter } from "./routes/item.routes.js";
app.use("/api/v1/item", itemRouter)

import { orderRouter } from "./routes/order.routes.js"; 
app.use("/api/v1/shop/order", orderRouter)

import { paymentRouter } from "./routes/payment.routes.js";
app.use("/api/v1/payment", paymentRouter)

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    return res.status(statusCode).json({
        statusCode,
        success: false,
        message,
        data: null
    });
});

export { app };
