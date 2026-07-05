import mongoose, { Schema } from "mongoose";

const itemSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Food item name is required"],
      trim: true,
      index: true // Search optimize karne ke liye index
    },
    description: {
      type: String,
      required: [true, "Food description is required"],
      trim: true
    },
    price: {
      type: Number,
      required: [true, "Base price is required"],
      min: [0, "Price cannot be negative"]
    },
    discountPrice: {
      type: Number,
      default: 0, // Agar dukan wala deal ya discount lagana chahe
      validate: {
        validator: function (value) {
          // Discount price hamesha asal price se kam honi chahiye
          return value < this.price;
        },
        message: "Discount price must be less than the actual price"
      }
    },
    image: {
      type: String, // Cloudinary URL
      required: [true, "Food item image is required"]
    },
    category: {
      type: String, // e.g., 'Burgers', 'Pizza', 'Desserts', 'Beverages'
      required: [true, "Food category is required"],
      trim: true
    },
    shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop", // 🟢 Yeh item kis shop ka hai, uski Reference ID
      required: [true, "Item must belong to a shop"]
    },
    isAvailable: {
      type: Boolean,
      default: true // Agar restaurant ke paas item khatam ho jaye, toh wo isay false kar sakta hai
    },
    isVeg: {
      type: Boolean,
      default: false // Craving ya pure veg/non-veg filter ke liye
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    numReviews: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true // Item kab add ya update hua automatically manage hoga
  }
);

export const Item = mongoose.model("Item", itemSchema);