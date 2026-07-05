import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import ms from "ms"
import { sendEmail } from "../utils/sendEmail.js";
import jwt from "jsonwebtoken";



const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token")
    }
}

const signUp = asyncHandler(async (req, res) => {
    const { fullName, email, password, mobile, role } = req.body;

    if (
        [fullName, email, password, mobile, role].some((field) => !field || field.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }

    if (password.trim().length < 6) {
        throw new ApiError(400, "Password must be at least 6 characters");
    }

    if (!email.includes("@")) {
        throw new ApiError(400, "Invalid email format. @ is required");
    }

    if (String(mobile).trim().length < 11) {
        throw new ApiError(400, "Mobile number must be at least 11 digits");
    }

    const existedUser = await User.findOne({ email });
    if (existedUser) {
        throw new ApiError(400, "User already exists.");
    }

    const user = await User.create({
        fullName,
        email,
        mobile,
        role,
        password,
    });


    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, createdUser, "User registered successfully. Please login to continue."));
});

const signIn = asyncHandler(async (req, res) => {

    const { email, password } = req.body

    if (!email || email.trim() === "") {
        throw new ApiError(400, "Email is required")
    }
    if (!password || password.trim() === "") {
        throw new ApiError(400, "Password is required")
    }

    const user = await User.findOne({ email })
    if (!user) {
        throw new ApiError(404, "User did not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(401, "Password is incorrect!")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)
    const loggedUser = await User.findById(user._id).select("-password -refreshToken")

    const accessTokenOptions = {
        httpOnly: true,
        secure: true,
        sameSite: none,
        maxAge: ms(process.env.ACCESS_TOKEN_EXPIRY)
    };
    const refreshTokenOptions = {
        httpOnly: true,
        secure: true,
        sameSite: none,

        maxAge: ms(process.env.REFRESH_TOKEN_EXPIRY)
    };

    return res
        .status(200)
        .cookie("AccessToken", accessToken, accessTokenOptions)
        .cookie("RefreshToken", refreshToken, refreshTokenOptions)
        .json(new ApiResponse(200, loggedUser, "User logged in successfully"))

})

const signOut = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        { returnDocument: 'after' }
    )

    const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    };

    return res
        .status(200)
        .clearCookie("AccessToken", cookieOptions)
        .clearCookie("RefreshToken", cookieOptions)
        .json(new ApiResponse(200, {}, "User logged Out successfully"))
})

const googleAuth = asyncHandler(async (req, res) => {

    const { fullName, email, mobile, role } = req.body;

    if (!email || !fullName) {
        throw new ApiError(400, "Name and Email are required from Google Auth");
    }
    if (!mobile || String(mobile).trim() === "") {
        throw new ApiError(400, "Mobile Number is requied")
    }

    let user = await User.findOne({ email });
    if (!user) {
        user = await User.create({
            fullName,
            email,
            mobile: mobile,
            role: role || "user",
        });
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const cookieOptions = {
        httpOnly: true, // Secure from XSS
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    };


    return res
        .status(200)
        .cookie("AccessToken", accessToken, { ...cookieOptions, maxAge: ms(process.env.ACCESS_TOKEN_EXPIRY) }) // 1 din
        .cookie("RefreshToken", refreshToken, { ...cookieOptions, maxAge: ms(process.env.REFRESH_TOKEN_EXPIRY) }) // 10 din (Ya jo bhi aapki policy hai)
        .json(
            new ApiResponse(
                200,
                {
                    user: await User.findById(user._id).select("-password -refreshToken") // Response mein tokens leak nahi karne
                },
                "Google Authentication Successful"
            )
        )
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incommingRefreshToken = req.cookies?.RefreshToken || req.body.refreshToken
    if (!incommingRefreshToken) {
        throw new ApiError(400, "Unauthorized request")
    }

    const decodedRefreshToken = jwt.verify(incommingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

    const user = await User.findById(decodedRefreshToken?._id)
    if (!user) {
        throw new ApiError(400, "Invalid refresh token")
    }

    if (incommingRefreshToken !== user?.refreshToken) {
        throw new ApiError(400, "Refresh token is expired or used")
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id)

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax"
    };

    return res
        .status(200)
        .cookie("AccessToken", accessToken, { ...options, maxAge: ms(process.env.ACCESS_TOKEN_EXPIRY) })
        .cookie("RefreshToken", newRefreshToken, { ...options, maxAge: ms(process.env.REFRESH_TOKEN_EXPIRY) })
        .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access token refresh Successfully"))


})

const sendOtp = asyncHandler(async (req, res) => {

    const { email } = req.body
    if (!email) {
        throw new ApiError(400, "Email is required")
    }

    const user = await User.findOne({ email })
    if (!user) {
        throw new ApiError(400, "Account with this email does not exist")
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = Date.now() * (10 * 60 * 1000);

    user.forgetPasswordOtp = otp;
    user.forgetPasswordOtpExpiry = otpExpiry;

    await user.save({ validateBeforeSave: false })

    const emailMessage = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; rounded: 10px;">
                <h2 style="color: #FF6B00;">CravingLoop Account Verification</h2>
                <p>Hello,</p>
                <p>You requested a password reset for your CravingLoop account. Use the following 6-digit verification code to proceed. It expire in 10mint:</p>
                <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #333; border-radius: 5px; margin: 20px 0;">
                    ${otp}
                </div>
                <p style="color: #777; font-size: 12px;">This code is strictly valid for 10 minutes. If you did not request this, please ignore this email.</p>
            </div>
        `;

    // Service call karke email bheinjein
    await sendEmail({
        email: user.email,
        subject: "CravingLoop - Password Reset OTP",
        message: emailMessage
    });

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "OTP sent successfully to your email")
        )
})

const verifyOtp = asyncHandler(async (req, res) => {

    const { email, otp } = req.body
    if (!email || !otp) {
        throw new ApiError(400, "Email and OTP is required")
    }

    const user = await User.findOne({ email })
    if (!user) {
        throw new ApiError(400, "User not Found!")
    }

    if (user.forgetPasswordOtp !== otp || user.forgetPasswordOtpExpiry < Date.now()) {
        throw new ApiError(400, "Invalid or Expired OTP")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, null, "OTP Verified successfully")
        );

})

const resetPassword = asyncHandler(async (req, res) => {

    const { email, password } = req.body
    if (!email || !password) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findOne({ email })
    if (!user) {
        throw new ApiError(400, "User not found")
    }

    user.password = password
    user.forgetPasswordOtp = undefined
    user.forgetPasswordOtpExpiry = undefined

    await user.save();

    return res
        .status(200)
        .json(
            new ApiResponse(200, "Password updated successfully")
        )


})


export { signUp, signIn, signOut, refreshAccessToken, sendOtp, verifyOtp, resetPassword, googleAuth };