import Recipe from "./recipe";
import User from "./user";
import SavedRecipe from "./savedRecipe";
import WeeklyMenu from "./weeklyMenu";
import ShoppingList from "./shoppingList";
import CommonIngredient from "./commonIngredient";
import RecipeIngredient from "./recipeIngredient";

User.hasMany(Recipe, {foreignKey: "ownerId", as: "recipes"});
Recipe.belongsTo(User, {foreignKey: "ownerId", as: "owner"});

User.hasMany(SavedRecipe, {foreignKey: "userId", as: "savedRecipes"});
SavedRecipe.belongsTo(User, {foreignKey: "userId", as: "user"});
SavedRecipe.belongsTo(Recipe, {foreignKey: "recipeId", as: "recipe"});
Recipe.hasMany(SavedRecipe, {foreignKey: "recipeId", as: "savedBy"});

Recipe.hasMany(RecipeIngredient, {
    foreignKey: "recipeId",
    as: "ingredientPositions",
    onDelete: "CASCADE",
});
RecipeIngredient.belongsTo(Recipe, {foreignKey: "recipeId", as: "recipe"});
CommonIngredient.hasMany(RecipeIngredient, {foreignKey: "commonIngredientId", as: "recipePositions"});
RecipeIngredient.belongsTo(CommonIngredient, {foreignKey: "commonIngredientId", as: "commonIngredient"});

User.hasMany(WeeklyMenu, {foreignKey: "userId", as: "menus"});
WeeklyMenu.belongsTo(User, {foreignKey: "userId", as: "user"});

User.hasMany(ShoppingList, {foreignKey: "userId", as: "shoppingLists"});
ShoppingList.belongsTo(User, {foreignKey: "userId", as: "user"});
ShoppingList.belongsTo(WeeklyMenu, {foreignKey: "menuId", as: "menu"});

export {CommonIngredient, Recipe, RecipeIngredient, SavedRecipe, ShoppingList, User, WeeklyMenu};
