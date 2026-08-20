import express from "express";
import { suggestTitle } from "../../controllers/ai.title.controller";
import { protect } from "../../middleware/auth.middleware";
import { aiLimiter } from "../../utils/rate.limiting";

const router = express.Router();
router.post("/suggest-title", protect, aiLimiter, suggestTitle);
export default router;
