import mongoose, { Schema } from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    password: {
        type: String, 
        required: false 
    },
    refreshToken: { 
        type: String
    },
    mobile: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["user", "owner", "deliveryBoy"], 
        required: true
    },
    forgetPasswordOtp: {
        type: String
    },
    forgetPasswordOtpExpiry: {
        type: String
    }
}, { timestamps: true })


userSchema.pre("save", async function () {
    if (!this.isModified("password")) return

    this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.isPasswordCorrect = async function (password) {
    if(!this.password) return false;
    return await bcrypt.compare(password, this.password)
}


userSchema.methods.generateAccessToken = function () { 
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)