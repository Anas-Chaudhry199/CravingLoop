import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createItem, deletItem, editItem, getShopItems } from "../controllers/item.controller.js";
import { upload } from "../middlewares/multer.middleware.js";


const itemRouter = Router()

itemRouter.route("/add-item/:shopId").post(
    verifyJWT,
    upload.single("image"),
    createItem

)

itemRouter.route("/edit-item/:itemId").post(
    verifyJWT,
    upload.single("image"),
    editItem
)

itemRouter.route("/get-shop-items/:shopId").get(getShopItems)

itemRouter.route("/delete-item/:itemId").delete(verifyJWT, deletItem)

export {itemRouter}