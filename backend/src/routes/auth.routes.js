import { Router } from "express"
import { googleAuth, refreshAccessToken, resetPassword, sendOtp, signIn, signOut, signUp, verifyOtp } from "../controllers/auth.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const authRouter = Router()


authRouter.route("/SignUp").post(signUp)
authRouter.route("/SignIn").post(signIn)
authRouter.route("/SignOut").post(verifyJWT, signOut)
authRouter.route("/refresh-token").post(verifyJWT, refreshAccessToken)
authRouter.route("/SendOTP").post(sendOtp)
authRouter.route("/VerifyOTP").post(verifyOtp)
authRouter.route("/ResetPassword").post(resetPassword)
authRouter.route("/Google-Authentication").post(googleAuth)

export default authRouter