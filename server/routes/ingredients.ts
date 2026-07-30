import express from "express";
import {listIngredients} from "../controllers/ingredientsController";
import {asyncHandler} from "../middleware/asyncHandler";

const router = express.Router();
router.get("/", asyncHandler(listIngredients));

export default router;
