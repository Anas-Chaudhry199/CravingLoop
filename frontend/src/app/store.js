import { configureStore } from "@reduxjs/toolkit"
import userReducer from "../features/user/user.Slice.js"
import shopMenuReducer from "../features/user/shopMenu.slice.js"
import orderReducer from "../features/user/order.slice.js"
import cartReducer from "../features/user/cart.slice.js"
import deliveryReducer from "../features/user/delivery.slice.js"

export const store = configureStore({
    reducer: {
        user: userReducer,
        shopMenu: shopMenuReducer,
        order: orderReducer,
        cart: cartReducer,
        delivery: deliveryReducer
    }
})