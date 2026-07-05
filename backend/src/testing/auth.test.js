import { signUp } from "../controllers/auth.controller.js"; 
const { ApiError } = require("../utils/ApiError.js");

// User model ko mock banao (ES Modules alignment ke sath)
jest.mock("../models/user.model.js", () => ({
    __esModule: true,
    default: {
        findOne: jest.fn(),
        create: jest.fn()
    }
}));

import User from "../models/user.model.js";

describe("Auth Controller - SignUp Unit Tests", () => {
    let mockReq;
    let mockRes;
    let mockNext;

    // Har test se pehle fresh setup
    beforeEach(() => {
        mockReq = {
            body: {}
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        mockNext = jest.fn();
        
        // Purane mocks ki history clear karo taake tests aapas mein mix na hon
        jest.clearAllMocks();
    });

    // Test Case 1: Khaali fields ka check
    test("Should call next with ApiError if any required field is missing", async () => {
        mockReq.body = {
            fullName: "", 
            email: "anas@test.com",
            password: "password123",
            mobile: "03001234567",
            role: "deliveryBoy"
        };

        await signUp(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
    });

    // Test Case 2: Password length check
    test("Should call next with ApiError if password is less than 6 characters", async () => {
        mockReq.body = {
            fullName: "Anas Dev",
            email: "anas@test.com",
            password: "123", 
            mobile: "03001234567",
            role: "deliveryBoy"
        };

        await signUp(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
    });

    // Test Case 3: Email format check
    test("Should call next with ApiError if email does not contain @", async () => {
        mockReq.body = {
            fullName: "Anas Dev",
            email: "invalidemail.com", 
            password: "password123",
            mobile: "03001234567",
            role: "deliveryBoy"
        };

        await signUp(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
    });

    // Test Case 4: Pehle se mojud user ka check (Database Mocking)
    test("Should call next with ApiError if user already exists in database", async () => {
        mockReq.body = {
            fullName: "Anas Dev",
            email: "anas.rider77@gmail.com",
            password: "securepassword123",
            mobile: "03001234567",
            role: "deliveryBoy"
        };

        // Jest ko bola ke fake user return kare
        User.findOne.mockResolvedValue({ email: "anas.rider77@gmail.com" });

        await signUp(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
    });
});