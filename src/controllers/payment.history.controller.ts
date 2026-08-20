import { Request, Response } from "express";
import PaymentHistory from "../models/PaymentHistory";


export const getPaymentHistory = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId;
        const requester = req.user;
        if (!requester) {
            return res.status(401).json({ success: false, message: "Authentication required" });
        }
        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }
        if (String(requester._id) !== userId && requester.role !== "admin") {
            return res.status(403).json({ success: false, message: "You cannot view another user's payment history" });
        }

        const history = await PaymentHistory.find({ user: userId })
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            count: history.length,
            history,
        });
    } catch (error: any) {
        console.error("Error getting payment history:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to get payment history",
            error: error.message || error,
        });
    }
};
