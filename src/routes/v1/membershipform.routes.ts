import { Router } from "express";
import {
    createMembershipForm,
    getAllMembershipForms,
    getMembershipFormById,
    updateMembershipForm,
    deleteMembershipForm,
} from "../../controllers/membershipForm.controller";
import { protect } from "../../middleware/auth.middleware";
import { authorizeRoles } from "../../middleware/role.middleware";
import { writeLimiter } from "../../utils/rate.limiting";

const router = Router();

// Applications are public; applicants cannot read or modify other submissions.
router.post("/", writeLimiter, createMembershipForm);
router.get("/", protect, authorizeRoles("admin"), getAllMembershipForms);
router.get("/:id", protect, authorizeRoles("admin"), getMembershipFormById);
router.patch("/:id", protect, authorizeRoles("admin"), updateMembershipForm);
router.put("/:id", protect, authorizeRoles("admin"), updateMembershipForm);
router.delete("/:id", protect, authorizeRoles("admin"), deleteMembershipForm);

export default router;
