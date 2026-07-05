import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { paymentProcess } from "../controllers/payment.controller.js";

const paymentRouter = Router()

paymentRouter.route("/process").post(verifyJWT, paymentProcess);

export {paymentRouter}