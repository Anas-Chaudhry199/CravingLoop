import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { deleteShop, editShop, getAllOwnerShops, getNearbyShops, getShopDetails, getShopDetailsById, shopregister, updateShopBanner, updateShopDetails } from "../controllers/shop.controller.js"
import { upload } from "../middlewares/multer.middleware.js"

const shopRouter = Router()

shopRouter.route("/shop-register").post(
    verifyJWT,
    upload.single("banner"),
    shopregister
)

shopRouter.route("/update-shop-details").post(
    verifyJWT,
    upload.single("banner"),
    editShop
)

shopRouter.route("/get-shop-details").get(verifyJWT, getShopDetails)

shopRouter.route("/update-Shop-details").patch(
    verifyJWT,
    updateShopDetails
)

shopRouter.route("/update-shop-banner").patch(
    verifyJWT,
    upload.single("banner"), // Multer middleware
    updateShopBanner
);

shopRouter.route("/delete-shop").delete(verifyJWT,deleteShop)

shopRouter.route("/nearby").get(getNearbyShops);

shopRouter.route("/c/:shopId").get(getShopDetailsById);

shopRouter.route("/get-all-owner-shops").get(verifyJWT, getAllOwnerShops);

export { shopRouter }