import mongoose, { Schema } from "mongoose";

const shopSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Shop name is required"],
      trim: true,
      index: true // Searching fast karne ke liye index lagaya
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User", // Hamare User model se link hoga (jis ka role admin/owner hoga)
      required: [true, "Shop must belong to an owner"]
    },
    description: {
      type: String,
      trim: true
    },
    cuisineType: [
      {
        type: String, // e.g., ['Fast Food', 'Desi', 'Chinese', 'Bakery']
        required: [true, "Please specify at least one cuisine type"]
      }
    ],
    banner: {
      type: String, // Cloudinary URL
      default: ""
    },
    // 🟢 Location Handling using GeoJSON (Takay radius wise dynamic shops search ho sakein)
    location: {
      type: {
        type: String,
        enum: ["Point"], // Database mein 'Point' hi store hoga
        required: true,
        default: "Point"
      },
      coordinates: {
        type: [Number], // [longitude, latitude] -> Note: Longitude pehle aata hai GeoJSON mein
        required: [true, "Shop coordinates are required"]
      }
    },
    address: {
      type: String,
      required: [true, "Physical address is required"],
      trim: true
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be less than 0"],
      max: [5, "Rating cannot be more than 5"]
    },
    numReviews: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true // Admin ya owner shop temporarily close bhi kar sakta hai
    },
    isFeatured: {
      type: Boolean,
      default: false // Premium/top shops ko top par dikhane ke liye
    }
  },
  {
    timestamps: true // createdAt aur updatedAt automatic handle honge
  }
);

// 🟢 2D Sphere Indexing (Yeh lagana zaroori hai agar hum radius-based near shops fetch karna chahte hain)
shopSchema.index({ location: "2dsphere" });

export const Shop = mongoose.model("Shop", shopSchema);