import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Shop } from "../models/shop.models.js"
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { Item } from "../models/item.models.js";

const createItem = asyncHandler(async (req, res) => {

    const {name, description, price, category, isAvailable} = req.body
    const {shopId} = req.params

    // 1. Validation: Zaroori fields check karein
    if (!name || !price || !category) {
        throw new ApiError(400, "Name, price, and category are required fields.");
    }

    // 2. Check karein ke shop exist karti hai ya nahi
    const shop = await Shop.findById(shopId)
    if (!shop) {
        throw new ApiError(400, "Shop not found.")
    }

    // 3. Security Check: Kya naya item add karne wala banda hi is shop ka owner hai?
    if (shop.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(400, "You are not authorized to add items to this shop.")
    }

    // 4. Multer se aayi hui Item Image ka local path nikalyein
    const itemImageLocalPath = req.file?.path
    if (!itemImageLocalPath) {
        throw new ApiError(400 ,"Item image is required.")
    }

    // 5. Cloudinary par image upload karein
    const uploadImage = await uploadOnCloudinary(itemImageLocalPath)
    if (!uploadImage) {
        throw new ApiError(500, "Error while uploading item image on Cloudinary.")
    }

    // 6. Database mein Item document create karein
    const item = await Item.create({
        name,
        description: description || "",
        price: Number(price),
        category,
        image: uploadImage.secure_url,
        shop: shopId,
        isAvailable: isAvailable !== undefined ? isAvailable: true
    })

    return res
    .status(201)
    .json(
        new ApiResponse(
            201,
            item,
            "Item added successfully to the menu."
        )
    )
}) 

const editItem = asyncHandler(async (req, res) => {

    const { itemId } = req.params;
    const { name, description, price, category, isAvailable } = req.body;

    // 1. Check karo ke item database mein exist karta hai ya nahi
    const item = await Item.findById(itemId);
    if (!item) {
        throw new ApiError(404, "Item not found.");
    }

    // 2. Security Check: Kya yeh item ussi ki shop ka hai jiska owner logged-in user hai?
    // Hamein shop ka data chahiye owner verify karne ke liye
    const shop = await Shop.findById(item.shop);
    if (!shop || shop.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to edit this item.");
    }

    // 3. Pehle se maujood image ka URL save rakhein agar change na ho toh
    let itemImageUrl = item.image;

    // 4. Agar user ne nayi image upload ki hai (Multer ke zariye)
    if (req.file?.path) {
        const newItemImageLocalPath = req.file.path;

        // Cloudinary par nayi image upload karein
        const uploadedImage = await uploadOnCloudinary(newItemImageLocalPath);
        if (!uploadedImage) {
            throw new ApiError(500, "Error while uploading new item image on Cloudinary.");
        }

        // 🚨 Purani image ko Cloudinary se delete karo agar pehle se URL maujood tha
        if (item.image) {
            // URL se publicId nikalne ka tareeqa (e.g., v12345/publicId.jpg -> publicId)
            const publicId = item.image.split("/").pop().split(".")[0];
            await deleteFromCloudinary(publicId);
        }

        // Naya secure URL assign kar do
        itemImageUrl = uploadedImage.secure_url;
    }

    // 5. Database mein item ko update karein
    const updatedItem = await Item.findByIdAndUpdate(
        itemId,
        {
            $set: {
                name: name || item.name,
                description: description !== undefined ? description : item.description,
                price: price ? Number(price) : item.price,
                category: category || item.category,
                image: itemImageUrl,
               isAvailable: isAvailable !== undefined ? (isAvailable === 'true' || isAvailable === true) : item.isAvailable
            }
        },
       { new: true }// Taake response mein updated data mile
    );

    // 6. Success Response return karein
    return res
        .status(200)
        .json(new ApiResponse(200, updatedItem, "Item details updated successfully."));
});

const getShopItems = asyncHandler(async (req, res) => {
    // Kisi specific shop ke saare menu items fetch karne ke liye
    const { shopId } = req.params;

    // 🚀 Update: 'isAvailable: true' check lagaya taake out-of-stock items frontend par show na hon
    const items = await Item.find({ 
        shop: shopId, 
        isAvailable: true 
    });

    return res
        .status(200)
        .json(new ApiResponse(200, items, "Menu items fetched successfully."));
});

const deletItem = asyncHandler(async (req, res) =>{

    const { itemId } = req.params;

    // 1. Check karo ke item exist karta hai ya nahi
    const item = await Item.findById(itemId);
    if (!item) {
        throw new ApiError(404, "Item not found.");
    }

    // 2. Security Check: Kya logged-in user hi is shop ka owner hai?
    const shop = await Shop.findById(item.shop);
    if (!shop || shop.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this item.");
    }

    // 3. Cloudinary se image delete karo agar maujood hai
    if (item.image) {
        try {
            // URL se publicId nikalne ka tareeqa (e.g., v12345/publicId.jpg -> publicId)
            const publicId = item.image.split("/").pop().split(".")[0];
            await deleteFromCloudinary(publicId);
        } catch (cloudinaryError) {
            console.error("Cloudinary asset deletion failed:", cloudinaryError);
            // Humm execution stop nahi karenge taake database se document clean ho jaye
        }
    }

    // 4. Database se item remove kar do
    await Item.findByIdAndDelete(itemId);

    return res
        .status(200)
        .json(new ApiResponse(200, { itemId }, "Item deleted successfully."));
})
export {createItem, editItem, getShopItems, deletItem}