import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { 
    getCustomerOrders, 
    getDeliveryOrders, 
    getShopOrders, 
    markOrderAsDelivered, 
    placeOrder, 
    updateOrderStatus 
} from "../controllers/order.controller.js";

const orderRouter = Router();

// 1. Customer naya order place karega
orderRouter.route("/place").post(verifyJWT, placeOrder);

// 2. Customer apni order history fetch karega
orderRouter.route("/history").get(verifyJWT, getCustomerOrders);

// 3. Shop Owner apni shop ke saare orders fetch karega
orderRouter.route("/orders").get(verifyJWT, getShopOrders);

// 4. Shop Owner order ka status update karega
orderRouter.route("/orders/:orderId/status").patch(verifyJWT, updateOrderStatus);

// 🚴 5. Rider Portal: Active/Assigned orders pool fetch karna (Secured)
orderRouter.route("/delivery/active").get(verifyJWT, getDeliveryOrders);

// 🚴 6. Rider Portal: Order ko 'Delivered' mark karna (Secured)
orderRouter.route("/delivery/complete/:orderId").patch(verifyJWT, markOrderAsDelivered);

export { orderRouter };