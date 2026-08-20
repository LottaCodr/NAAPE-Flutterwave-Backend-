import crypto from "crypto";
import { Request, Response } from "express";
import { Subscription } from "../models/Subscription";
import PaymentHistory from "../models/PaymentHistory";

const safeEqual = (left: string, right: string) => {
    const a = Buffer.from(left);
    const b = Buffer.from(right);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
};

export const handleWebhook = async (req: Request, res: Response) => {
    const signature = String(req.headers["verif-hash"] || req.headers["verify-hash"] || "");
    const webhookSecret = process.env.FLW_HASH || "";
    if (!signature || !webhookSecret || !safeEqual(signature, webhookSecret)) {
        return res.status(401).json({ message: "Invalid webhook signature" });
    }

    try {
        const event = req.body;
        if (!event || typeof event.event !== "string" || !event.data) {
            return res.status(400).json({ message: "Invalid webhook payload" });
        }

        if (event.event === "subscription.payment.completed") {
            const data = event.data;
            const subscription = await Subscription.findOne({
                $or: [
                    { flutterwaveSubscriptionId: String(data.subscription_id || "") },
                    { userId: data.meta?.userId, planId: data.meta?.planId },
                ],
            });

            // Acknowledge unknown records so Flutterwave does not retry forever.
            if (!subscription) return res.status(200).json({ status: "ignored" });

            subscription.status = "active";
            subscription.startDate = subscription.startDate || new Date();
            if (data.subscription_id) subscription.flutterwaveSubscriptionId = String(data.subscription_id);
            await subscription.save();

            await PaymentHistory.updateOne(
                { transactionId: String(data.id || data.tx_ref) },
                {
                    $setOnInsert: {
                        user: subscription.userId,
                        type: "subscription",
                        transactionId: String(data.id || data.tx_ref),
                        amount: Number(data.amount),
                        currency: String(data.currency || subscription.currency).toUpperCase(),
                        status: "successful",
                        metadata: { subscriptionId: subscription._id, txRef: data.tx_ref },
                    },
                },
                { upsert: true }
            );
        } else if (event.event === "subscription.cancelled") {
            await Subscription.findOneAndUpdate(
                { flutterwaveSubscriptionId: String(event.data.subscription_id) },
                { status: "cancelled", endDate: new Date(), isActive: false }
            );
        }

        return res.status(200).json({ status: "ok" });
    } catch (error) {
        console.error("Webhook processing failed:", error);
        return res.status(500).json({ message: "Webhook processing failed" });
    }
};
