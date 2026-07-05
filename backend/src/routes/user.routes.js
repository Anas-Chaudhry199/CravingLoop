import { verifyJWT } from "../middlewares/auth.middleware.js"
import { getCurrentUser } from "../controllers/user.controller.js"
import { Router } from "express"


const userRouter = Router()

userRouter.route("/current-user").get(verifyJWT,getCurrentUser)

export default userRouter;