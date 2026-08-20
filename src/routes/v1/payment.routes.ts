import { Router } from "express";
import { createPayment } from "../../controllers/payment.controller";
import {
    createPlan,
    initializeSubscriptionPayment,
    verifySubscriptionPayment,
    getSubscriptionStatus,
} from "../../controllers/subscription.controller";
import { chargeAndTokenize, createTokenizedCharge } from "../../controllers/token.controller";
import { createRecipient, createTransfer } from "../../controllers/transfer.controller";
import { getEventPaymentStatus, registerEventPayment, verifyEventPayment } from "../../controllers/event.controller";
import { getPaymentHistory } from "../../controllers/payment.history.controller";
import { protect } from "../../middleware/auth.middleware";
import { authorizeRoles } from "../../middleware/role.middleware";

const router = Router();

// Customer payment operations always require an authenticated account.
router.post("/create-link", protect, createPayment);
router.post("/subscription/initialize-payment", protect, initializeSubscriptionPayment);
router.get("/subscription/verify", protect, verifySubscriptionPayment);
router.get("/subscription/status", protect, getSubscriptionStatus);
router.post("/events/register", protect, registerEventPayment);
router.get("/events/verify", protect, verifyEventPayment);
router.get("/events/status", protect, getEventPaymentStatus);
router.get("/history/:userId", protect, getPaymentHistory);

// High-risk financial operations are strictly administrator-only.
router.post("/plans", protect, authorizeRoles("admin"), createPlan);
router.post("/tokenize", protect, authorizeRoles("admin"), chargeAndTokenize);
router.post("/token-charges", protect, authorizeRoles("admin"), createTokenizedCharge);
router.post("/recipients", protect, authorizeRoles("admin"), createRecipient);
router.post("/transfers", protect, authorizeRoles("admin"), createTransfer);

export default router;
