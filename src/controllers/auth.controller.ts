import { Request, Response } from "express";
import User from "../models/User";
import { generateToken } from "../utils/generateToken";
import sendEmail from "../utils/sendEmail";
import { welcomeEmailHTML } from "../utils/emailTemplatesHTML";
// import { OAuth2Client } from "google-auth-library";

export const registerUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;
        if (typeof name !== "string" || name.trim().length < 2) {
            return res.status(400).json({ message: "Name must be at least 2 characters" });
        }
        if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ message: "A valid email address is required" });
        }
        if (typeof password !== "string" || password.length < 8 || password.length > 128) {
            return res.status(400).json({ message: "Password must be between 8 and 128 characters" });
        }
        const normalizedEmail = email.trim().toLowerCase();
        // Public registration must never accept a privileged role from the client.
        const user = await User.create({ name: name.trim(), email: normalizedEmail, password, role: "member" });

        // Send welcome email
        try {
            await sendEmail({
                to: user.email,
                subject: "Welcome to NAAPE - Account Created Successfully",
                text: `Dear ${user.name},\n\nWelcome to the Nigerian Association of Aircraft Pilots and Engineers (NAAPE)! Your account has been created successfully.\n\nBest regards,\nThe NAAPE Team`,
                html: welcomeEmailHTML(user.name, user.email)
            });
        } catch (emailError) {
            console.error("Failed to send welcome email:", emailError);
            // Don't fail registration if email fails
        }

        res.status(201).json({
            message: "Account Created successfully",
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(String(user._id), user.role),
        });
    } catch (error: any) {
        // ✅ Handle duplicate email error
        if (error.code === 11000 && error.keyPattern?.email) {
            return res.status(409).json({
                message: "Email already exists",
            });
        }
        res.status(500).json({ message: error.message });
    }
}

export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail }).select("+password");

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Check if user is Google-only (no password set)
        if (user.authProvider === "google" && !user.password) {
            return res.status(400).json({ 
                message: "This account uses Google Sign-In. Please sign in with Google." 
            });
        }

        if (await user.matchePassword(password)) {
            // Send login notification email
            try {
                const { loginNotificationEmailHTML } = await import("../utils/emailTemplatesHTML");
                await sendEmail({
                    to: user.email,
                    subject: "New Login to Your NAAPE Account",
                    text: `Dear ${user.name},\n\nA new login was detected on your account at ${new Date().toLocaleString()}.\n\nIf this wasn't you, please secure your account immediately.\n\nBest regards,\nThe NAAPE Team`,
                    html: loginNotificationEmailHTML(user.name, new Date(), req.ip)
                });
                console.log(`Login notification email sent to ${user.email}`);
            } catch (emailError) {
                console.error("Failed to send login notification:", emailError);
            }

            res.status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(String(user._id), user.role),
            });
        } else {
            res.status(401).json({ message: "Invalid credentials" });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}


// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// // Handle Google Sign-In
// export const googleAuth = async (req: Request, res: Response) => {
//     const { credential } = req.body; // Google ID Token

//     try {
//         // Verify token
//         const ticket = await client.verifyIdToken({
//             idToken: credential,
//             audience: process.env.GOOGLE_CLIENT_ID,
//         });

//         const payload = ticket.getPayload();
//         if (!payload) {
//             return res.status(400).json({ message: "Invalid Google token" });
//         }

//         const { email, name, picture, sub } = payload;
//         const normalizedEmail = email.trim().toLowerCase();

//         // Check if user exists
//         let user = await User.findOne({ email: normalizedEmail });

//         if (!user) {
//             // Create a new user
//             user = await User.create({
//                 name,
//                 email: normalizedEmail,
//                 password: sub, // not used, but required to satisfy schema
//                 role: "member",
//                 avatar: picture
//             });
//         }

//         // Generate JWT
//         const token = jwt.sign(
//             { id: user._id, role: user.role },
//             process.env.JWT_SECRET!,
//             { expiresIn: "30d" }
//         );

//         res.status(200).json({
//             message: "Google login successful",
//             user,
//             token,
//         });
//     } catch (error: any) {
//         res.status(500).json({ message: error.message });
//     }
// };

