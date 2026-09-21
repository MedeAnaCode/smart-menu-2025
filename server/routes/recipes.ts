import express from "express";
import {
    createRecipe,
    cloneSavedRecipe,
    deleteRecipe,
    getAllRecipes,
    getRecipe,
    getMyRecipes,
    publishRecipe,
    savePublishedRecipe,
    unpublishRecipe,
    unsaveRecipe,
    updateRecipe,
    uploadImage
} from "../controllers/recipesController";
import {requireAuth} from "../middleware/auth";
import {asyncHandler} from "../middleware/asyncHandler";
import {uploadRecipeImage} from "../middleware/upload";
import {importRecipe} from "../controllers/recipeImportController";

const router = express.Router();

router.get("/", asyncHandler(getAllRecipes));
router.get("/mine", asyncHandler(requireAuth), asyncHandler(getMyRecipes));
router.post("/image", asyncHandler(requireAuth), uploadRecipeImage.single("image"), asyncHandler(uploadImage));
router.post("/import", asyncHandler(requireAuth), asyncHandler(importRecipe));
router.post("/", asyncHandler(requireAuth), asyncHandler(createRecipe));
router.get("/:id", asyncHandler(getRecipe));
router.patch("/:id", asyncHandler(requireAuth), asyncHandler(updateRecipe));
router.delete("/:id", asyncHandler(requireAuth), asyncHandler(deleteRecipe));
router.post("/:id/publish", asyncHandler(requireAuth), asyncHandler(publishRecipe));
router.post("/:id/unpublish", asyncHandler(requireAuth), asyncHandler(unpublishRecipe));
router.post("/:id/save", asyncHandler(requireAuth), asyncHandler(savePublishedRecipe));
router.delete("/:id/save", asyncHandler(requireAuth), asyncHandler(unsaveRecipe));
router.post("/:id/clone", asyncHandler(requireAuth), asyncHandler(cloneSavedRecipe));

export default router;
