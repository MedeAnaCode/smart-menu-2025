import express from "express";
import {
    addRecipeToMeal,
    calculateShoppingList,
    createMenu,
    deleteMenu,
    getShoppingList,
    listMenus,
    updateMeal,
    updateMenu,
    updateShoppingList
} from "../controllers/menuController";
import {requireAuth} from "../middleware/auth";
import {asyncHandler} from "../middleware/asyncHandler";

const router = express.Router();

router.use(asyncHandler(requireAuth));
router.get("/", asyncHandler(listMenus));
router.post("/", asyncHandler(createMenu));
router.patch("/:id", asyncHandler(updateMenu));
router.delete("/:id", asyncHandler(deleteMenu));
router.post("/:menuId/recipes", asyncHandler(addRecipeToMeal));
router.patch("/:menuId/meals/:mealId", asyncHandler(updateMeal));
router.get("/:menuId/shopping-list", asyncHandler(getShoppingList));
router.post("/:menuId/shopping-list/calculate", asyncHandler(calculateShoppingList));
router.patch("/:menuId/shopping-list", asyncHandler(updateShoppingList));

export default router;
