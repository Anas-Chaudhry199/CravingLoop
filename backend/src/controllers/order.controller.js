import { Order } from "../models/order.model.js";
import { Shop } from "../models/shop.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// 1. Owner apni shop/shops ke saare orders fetch karega
const getShopOrders = asyncHandler(async (req, res) => {
    const { shopId } = req.query; // Agar frontend se specific shop click ho kar aaye

    // 🟢 CASE A: Agar frontend se specific shopId aayi hai (e.g., click kar ke dashboard khola)
    if (shopId) {
        const shop = await Shop.findOne({ _id: shopId, owner: req.user._id });
        if (!shop) {
            throw new ApiError(404, "Authorized shop not found.");
        }

        const orders = await Order.find({ shop: shop._id })
            .populate("customer", "fullName email mobile")
            .populate("orderItems.menuItem", "name price image category")
            .sort({ createdAt: -1 });

        return res
            .status(200)
            .json(new ApiResponse(200, orders, `Orders for ${shop.name} fetched successfully.`));
    }

    // 🟢 CASE B: Fallback (Agar frontend se shopId nahi aayi, toh is owner ki SAARI 10 SHOPS ke orders le ao)
    const allOwnerShops = await Shop.find({ owner: req.user._id }).select("_id");
    const shopIdsArray = allOwnerShops.map(shop => shop._id);

    if (shopIdsArray.length === 0) {
        throw new ApiError(404, "No shops found for this owner.");
    }

    // $in operator use kar ke saari dummy shops ke orders ek sath nikal lo
    const orders = await Order.find({ shop: { $in: shopIdsArray } })
        .populate("customer", "fullName email mobile")
        .populate("orderItems.menuItem", "name price image category")
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, orders, "All dynamic shop orders for this owner fetched successfully."));
});
// 2. Owner order ka status change karega
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    // 1. Status validity check (Aapka original logic)
    const validStatuses = ["Pending", "Preparing", "Out for Delivery", "Delivered", "Cancelled"];
    if (!status || !validStatuses.includes(status)) {
        throw new ApiError(400, "Invalid or missing order status.");
    }

    // 2. 🟢 FIX: Is owner ki saari 10 dummy/real shops ki IDs nikalen
    const allOwnerShops = await Shop.find({ owner: req.user._id }).select("_id");
    const shopIdsArray = allOwnerShops.map(shop => shop._id);

    if (shopIdsArray.length === 0) {
        throw new ApiError(404, "Authorized shop not found.");
    }

    // 3. 🟢 FIX: Check karein ke order is owner ki kisi bhi register shop se belong karta hai ya nahi ($in operator)
    const order = await Order.findOne({ 
        _id: orderId, 
        shop: { $in: shopIdsArray } 
    });
    
    if (!order) {
        throw new ApiError(404, "Order not found or you are not authorized to manage it.");
    }

    // 4. Status update karna
    order.status = status;

    // 5. COD payment check (Aapka original logic)
    if (status === "Delivered" && order.paymentMethod === "COD") {
        order.isPaid = true;
    }

    // 6. Save data
    await order.save();

    // 7. Data populate karke response return karna (Aapka original logic)
    const updatedOrder = await Order.findById(order._id)
        .populate("customer", "fullName email mobile")
        .populate("orderItems.menuItem", "name price image");

    return res
        .status(200)
        .json(new ApiResponse(200, updatedOrder, `Order status successfully marked as ${status}.`));
});

// 3. Customer order place karega
const placeOrder = asyncHandler(async (req, res) => {
    const { shop, orderItems, totalAmount, deliveryAddress, paymentMethod } = req.body;

    if (!shop) {
        throw new ApiError(400, "Order must belong to a specific shop.");
    }
    if (!orderItems || orderItems.length === 0) {
        throw new ApiError(400, "Order must contain at least one menu item.");
    }
    if (!deliveryAddress || !deliveryAddress.trim()) {
        throw new ApiError(400, "Delivery address is required.");
    }

    const newOrder = await Order.create({
        customer: req.user._id,
        shop,
        orderItems,
        totalAmount,
        deliveryAddress,
        paymentMethod: paymentMethod || "COD"
    });

    if (!newOrder) {
        throw new ApiError(500, "Something went wrong while placing the order.");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, newOrder, "Order placed successfully! 🏁"));
});

// 4. Customer apni poori order history dekhega
const getCustomerOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ customer: req.user._id })
        .populate("shop", "name location logo")
        .populate("orderItems.menuItem", "name price image")
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, orders, "Customer orders history fetched successfully."));
});


// 🚴 5. SECURED CONTROLLER: Rider portal ke liye active/assigned orders lena
const getDeliveryOrders = asyncHandler(async (req, res) => {
    // 🛡️ Extra Security Layer: Verify if logged-in user is actually a deliveryBoy
    if (req.user?.role !== "deliveryBoy") {
        throw new ApiError(403, "Access denied. Only delivery personnel can access this portal.");
    }

    const riderId = req.user._id;

    // Sirf woh orders jo tayar hain ('Out for Delivery') aur unassigned hain YA isi rider ko assigned hain
    const deliveries = await Order.find({
        status: "Out for Delivery",
        $or: [
            { deliveryBoy: null },
            { deliveryBoy: riderId }
        ]
    })
    .populate("customer", "fullName mobile email")
    .populate("orderItems.menuItem", "name price quantity")
    .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, deliveries, "Active rider deliveries fetched successfully."));
});

// 🚴 6. SECURED CONTROLLER: Rider order ko 'Delivered' mark karega
const markOrderAsDelivered = asyncHandler(async (req, res) => {
    // 🛡️ Extra Security Layer: Verify if logged-in user is actually a deliveryBoy
    if (req.user?.role !== "deliveryBoy") {
        throw new ApiError(403, "Access denied. Action authorized for delivery personnel only.");
    }

    const { orderId } = req.params;
    const riderId = req.user._id;

    const order = await Order.findById(orderId);
    if (!order) {
        throw new ApiError(404, "Delivery order record not found.");
    }

    // Protection Check: Agar order kisi aur rider ko already assigned hai toh handle karein
    if (order.deliveryBoy && order.deliveryBoy.toString() !== riderId.toString()) {
        throw new ApiError(400, "This order is already being processed by another delivery agent.");
    }

    // Status updates
    order.status = "Delivered";
    order.deliveryBoy = riderId; // Order ko complete karne wale rider ki ID mapping

    // Cash Handling
    if (order.paymentMethod === "COD") {
        order.isPaid = true;
    }

    await order.save();

    const updatedDelivery = await Order.findById(order._id)
        .populate("customer", "fullName mobile email");

    return res
        .status(200)
        .json(new ApiResponse(200, updatedDelivery, "Shipment status marked as Delivered successfully! 🎉"));
});

export { 
    getShopOrders, 
    updateOrderStatus, 
    placeOrder, 
    getCustomerOrders,
    getDeliveryOrders,      // Exported
    markOrderAsDelivered    // Exported
};