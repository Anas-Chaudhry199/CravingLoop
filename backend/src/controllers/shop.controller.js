import { asyncHandler } from "../utils/asyncHandler.js"; 
import { Shop } from "../models/shop.models.js"; 
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { Item } from "../models/item.models.js";

const shopregister = asyncHandler(async (req, res) => {
    const { name, description, cuisineType, address, longitude, latitude } = req.body;

    if (!name || !cuisineType || !address || !longitude || !latitude) {
        throw new ApiError(400, "Name, cuisineType, address, and coordinates are required fields.");
    }

    const existingShop = await Shop.findOne({ owner: req.user?._id });
    if (existingShop) {
        throw new ApiError(400, "An owner can only register one shop/restaurant on CravingLoop.");
    }

    const bannerLocalPath = req.file?.path;
    if (!bannerLocalPath) {
        throw new ApiError(400, "Shop banner image is required");
    }

    const uploadBanner = await uploadOnCloudinary(bannerLocalPath);
    if (!uploadBanner) {
        throw new ApiError(400, "Error while uploading shop banner on Cloudinary.");
    }

    const cuisines = Array.isArray(cuisineType)
        ? cuisineType 
        : cuisineType.split(",").map(c => c.trim());

    const shop = await Shop.create({
        name,
        description: description || "",
        cuisineType: cuisines,
        address,
        owner: req.user._id,
        banner: uploadBanner.secure_url, 
        logo: "", 
        location: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
        }
    });

    return res
        .status(201)
        .json(new ApiResponse(201, shop, "Shop registered successfully"));
});

const editShop = asyncHandler(async (req,res) =>{
    const { name, description, cuisineType, address, longitude, latitude } = req.body; 

    const shop = await Shop.findOne({owner: req.user._id})
    if (!shop) {
        throw new ApiError(404, "Shop not found!")
    }

    if (name) shop.name = name
    shop.description = description !== undefined ? description : shop.description
    shop.address = address || shop.address

    if (cuisineType) {
        shop.cuisineType = Array.isArray(cuisineType)
        ? cuisineType : cuisineType.split(",").map(c => c.trim())
    }

    if (longitude && latitude) {
        shop.location = {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
        };
    }

    if (req.file?.path) {
        const bannerLocalPath = req.file.path;
        const uploadBanner = await uploadOnCloudinary(bannerLocalPath);
        if (!uploadBanner) {
            throw new ApiError(500, "Error while uploading new banner on Cloudinary.");
        }

        if (shop.banner) {
            const oldBannerPublicId = shop.banner.split('/').pop().split('.')[0];
            await deleteFromCloudinary(oldBannerPublicId); 
        }

        shop.banner = uploadBanner.secure_url;
    }

    const updatedShop = await shop.save();

    return res
        .status(200)
        .json(new ApiResponse(200, updatedShop, "Shop details updated successfully."));
})

const getShopDetails = asyncHandler(async (req, res) => {
    const { shopId } = req.query;

    let query = { owner: req.user._id };
    if (shopId) {
        query = { _id: shopId, owner: req.user._id };
    }

    const shop = await Shop.findOne(query);
    
    return res
        .status(200)
        .json(new ApiResponse(200, shop, "Shop details fetched successfully."));
});

const updateShopDetails = asyncHandler(async (req, res) => {
    const { name, description, address, cuisineType, shopId } = req.body; 

    if (!name || name.trim() === "") {
        throw new ApiError(400, "Shop name is required.");
    }
    if (!address || address.trim() === "") {
        throw new ApiError(400, "Physical address is required.");
    }

    let query = { owner: req.user._id };
    if (shopId) {
        query = { _id: shopId, owner: req.user._id };
    }

    const shop = await Shop.findOne(query);
    if (!shop) {
        throw new ApiError(404, "Shop not found or you are not the authorized owner.");
    }

    shop.name = name.trim();
    shop.description = description ? description.trim() : shop.description;
    shop.address = address.trim();

    if (cuisineType) {
        if (Array.isArray(cuisineType)) {
            shop.cuisineType = cuisineType;
        } else if (typeof cuisineType === "string") {
            shop.cuisineType = cuisineType
                .split(",")
                .map((cuisine) => cuisine.trim())
                .filter((cuisine) => cuisine !== "");
        }
    }

    const updatedShop = await shop.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, updatedShop, "Shop details updated successfully."));
});

// 🟢 FIXED: Ab yeh controller body/payload se dynamic shopId le kar us specific dummy/real shop ka banner badal sakta hai!
const updateShopBanner = asyncHandler(async (req, res) => {
    const bannerLocalPath = req.file?.path;
    if (!bannerLocalPath) {
        throw new ApiError(400, "Banner image file is missing.");
    }

    const { shopId } = req.body; // 👈 Multi-shop management sync

    let query = { owner: req.user._id };
    if (shopId) {
        query = { _id: shopId, owner: req.user._id };
    }

    const shop = await Shop.findOne(query);
    if (!shop) {
        throw new ApiError(404, "Shop not found or you are not the authorized owner.");
    }

    if (shop.banner) {
        try {
            const publicId = shop.banner.split("/").pop().split(".")[0];
            await deleteFromCloudinary(publicId); 
        } catch (cloudinaryError) {
            console.error("Old banner deletion failed from Cloudinary:", cloudinaryError);
        }
    }

    const uploadedBanner = await uploadOnCloudinary(bannerLocalPath); 
    if (!uploadedBanner?.secure_url) {
        throw new ApiError(500, "Error while uploading banner on cloud storage.");
    }

    shop.banner = uploadedBanner.secure_url; // secure_url ensures production safety
    await shop.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, shop, "Shop banner updated successfully."));
});

// 🟢 FIXED: Ab yeh query strings se targeted shopId read karega taake specific dummy shop uda sake
const deleteShop = asyncHandler(async (req, res) => {
    if (!req.user?._id) {
        throw new ApiError(401, "Unauthorized request. User missing.");
    }

    const { shopId } = req.query; // 👈 query param parse pipeline

    let query = { owner: req.user._id };
    if (shopId) {
        query = { _id: shopId, owner: req.user._id };
    }

    const shop = await Shop.findOne(query);
    if (!shop) {
        throw new ApiError(404, "No registered shop found matching this criteria.");
    }

    if (shop.banner && shop.banner.includes("res.cloudinary.com")) {
        try {
            const bannerPublicId = shop.banner.split('/').pop().split('.')[0];
            if (bannerPublicId) {
                await deleteFromCloudinary(bannerPublicId);
            }
        } catch (err) {
            console.error("Cloudinary shop banner deletion failed:", err);
        }
    }

    let menuItems = [];
    try {
        menuItems = await Item.find({ shop: shop._id });
    } catch (err) {
        console.error("Failed to fetch menu items during deletion:", err);
    }

    if (menuItems.length > 0) {
        for (const item of menuItems) {
            if (item.image && item.image.includes("res.cloudinary.com")) {
                try {
                    const itemImagePublicId = item.image.split('/').pop().split('.')[0];
                    if (itemImagePublicId) {
                        await deleteFromCloudinary(itemImagePublicId);
                    }
                } catch (err) {
                    console.error(`Cloudinary image deletion failed for item ${item._id}:`, err);
                }
            }
        }
    }

    await Item.deleteMany({ shop: shop._id });
    await Shop.findByIdAndDelete(shop._id);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Shop and all associated items deleted permanently.")); 
});

const getNearbyShops = asyncHandler(async (req, res) => {
    const longitude = req.query.lng || req.query.longitude;
    const latitude = req.query.lat || req.query.latitude;

    if (!longitude || !latitude) {
        throw new ApiError(400, "Longitude and Latitude are required to scan nearby restaurants!");
    }

    let shops = [];

    try {
        shops = await Shop.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(longitude), parseFloat(latitude)] 
                    },
                    $maxDistance: 50000 
                }
            }
        });
    } catch (error) {
        console.error("Geospatial query failed, switching to global fallback:", error);
    }

    if (shops.length < 6) {
        const existingIds = shops.map(s => s._id);

        const backupShops = await Shop.find({
            _id: { $nin: existingIds } 
        }).sort({ createdAt: -1 }); 

        shops = [...shops, ...backupShops];
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                shops, 
                `Shops synchronized successfully. Fetched ${shops.length} restaurants total.`
            )
        );
});

const getShopDetailsById = asyncHandler(async (req, res) => {
    const { shopId } = req.params; 

    const shop = await Shop.findById(shopId);

    if (!shop) {
        return res
            .status(404)
            .json(new ApiResponse(404, null, "Restaurant not found!"));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, shop, "Restaurant details fetched successfully."));
});

const getAllOwnerShops = asyncHandler(async (req, res) => {
    const shops = await Shop.find({ owner: req.user._id }).select("name _id");
    
    return res
        .status(200)
        .json(new ApiResponse(200, shops, "All owner shops fetched successfully."));
});

export { shopregister, editShop, getShopDetails, updateShopDetails, updateShopBanner, deleteShop, getNearbyShops, getShopDetailsById, getAllOwnerShops}