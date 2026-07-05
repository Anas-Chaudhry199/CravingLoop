import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "User", // Hamare User model se link hoga
      required: [true, "Order must belong to a customer"]
    },
    shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop", // Hamare Shop model se link hoga
      required: [true, "Order must belong to a specific shop"]
    },
    orderItems: [
      {
        menuItem: {
          type: Schema.Types.ObjectId,
          ref: "Item",
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity cannot be less than 1"],
          default: 1
        },
        priceAtOrder: {
          type: Number,
          required: true
        }
      }
    ],
    totalAmount: {
      type: Number,
      required: true,
      default: 0
    },
    deliveryAddress: {
      type: String,
      required: [true, "Delivery address is required"],
      trim: true
    },
    status: {
      type: String,
      enum: ["Pending", "Preparing", "Out for Delivery", "Delivered", "Cancelled"],
      default: "Pending"
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "Card"],
      default: "COD"
    },
    // Isko status ya paymentMethod ke paas inject kar do
    deliveryBoy: {
      type: Schema.Types.ObjectId,
      ref: "User", // Hamare User model se link hoga (jahan role "deliveryBoy" hai)
      default: null
    },
    isPaid: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

export const Order = mongoose.model("Order", orderSchema);