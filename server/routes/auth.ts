import express from "express";
import {me} from "../controllers/authController";
import {requireAuth} from "../middleware/auth";
import {asyncHandler} from "../middleware/asyncHandler";

const router = express.Router();

router.get("/me", asyncHandler(requireAuth), asyncHandler(me));

export default router;
