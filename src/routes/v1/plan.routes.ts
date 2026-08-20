import { Router } from "express";
import { createSubscriptionPlan, getAllPlans } from "../../controllers/subscription.controller";
import { protect } from "../../middleware/auth.middleware";
import { authorizeRoles } from "../../middleware/role.middleware";

const router = Router();

router.get("/", getAllPlans);
router.get("/get-plans", getAllPlans); // Legacy client compatibility.
router.post("/", protect, authorizeRoles("admin"), createSubscriptionPlan);

export default router;
