import axios from "axios";
import { Request, Response } from "express";

export const createPayment = async (req: Request, res: Response) => {
    try {
        const amount = Number(req.body.amount);
        const user = req.user;
        if (!user) return res.status(401).json({ message: "Authentication required" });
        if (!Number.isFinite(amount) || amount <= 0 || amount > 100_000_000) {
            return res.status(400).json({ message: "A valid payment amount is required" });
        }
        const email = user.email;
        const name = user.name;

        // Generate a unique reference
        const tx_ref = `tx-${Date.now()}`;

        const payload = {
            tx_ref,
            amount,
            currency: "NGN",
            redirect_url: `${process.env.FRONTEND_URL}/payment/success`,
            customer: {
                email,
                name
            },
            customizations: {
                title: "Payment",
                logo: "https://yourlogo.com/logo.png"
            }
        };

        const response = await axios.post(
            `${process.env.FLW_BASE_URL}/payments`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`
                }
            }
        );

        return res.status(200).json({
            status: "success",
            link: response.data.data.link,
            tx_ref
        });

    } catch (error: any) {
        return res.status(500).json({
            status: "error",
            message: error.response?.data || error.message
        });
    }
};


