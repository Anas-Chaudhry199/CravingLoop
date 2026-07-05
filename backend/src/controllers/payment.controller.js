import Stripe from "stripe";
import { asyncHandler } from "../utils/asyncHandler.js"; // 👈 check casing based on your project
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"; // Agar aapke paas standard ApiResponse wrapper hai

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const paymentProcess = asyncHandler(async (req, res) => {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
        throw new ApiError(400, "Valid amount is required for payment processing");
    }

    // Stripe amount humesha cents/paisa mein leta hai (e.g., Rs. 500 ke liye 500 * 100 = 50000 cents)
    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: "pkr", // Pakistan portfolio market ke liye 'pkr' best hai
        metadata: {
            userId: req.user?._id?.toString() || "guest_user", // Agar user login metadata trace rakhna ho
        },
        automatic_payment_methods: {
            enabled: true, // Card aur baqi compatible automatic variants active karne ke liye
        },
    });

    // Response send karein backend flow se
    return res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            { clientSecret: paymentIntent.client_secret }, 
            "Payment Intent generated successfully"
        )
    );
});

export { paymentProcess };