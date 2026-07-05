import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    
    try {
        if (!localFilePath) return null

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto" // Yeh bilkul theek hai, upload ke waqt auto detect hona chahiye
        })
        
        // File successfully upload hone ke baad local temp file delete karo
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath)
        }
        return response
    } catch (error) {
        // Agar upload fail ho jaye tab bhi temporary file ko local system se lazmi remove karo
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath)
        }
        console.error("Error while uploading file on Cloudinary:", error);
        return null
    }
}

const deleteFromCloudinary = async (publicId) => {
    try {
        if (!publicId) return null;
        
        // 🟢 FIX: Destroy method mein resource_type pass karne ki zaroorat nahi hoti default images ke liye, 
        // ya agar karni ho toh exact type 'image' likha jata hai. Auto bhejney se API error de sakta hai.
        const response = await cloudinary.uploader.destroy(publicId);
        
        return response;
    } catch (error) {
        console.error("Error while deleting file from Cloudinary:", error);
        return null;
    }
}

export { uploadOnCloudinary, deleteFromCloudinary }