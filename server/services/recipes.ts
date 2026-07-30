import type {Transaction} from "sequelize";
import {CommonIngredient, Recipe, RecipeIngredient, User} from "../models";
import type {Ingredient, Recipe as RecipeType} from "../../src/types";

export const normalizeIngredientName = (name: string) => name.trim().toLocaleLowerCase("ru-RU");

export async function replaceRecipeIngredients(
    recipeId: number,
    ingredients: Ingredient[],
    transaction: Transaction,
) {
    await RecipeIngredient.destroy({where: {recipeId}, transaction});

    for (const [position, ingredient] of ingredients.entries()) {
        if (ingredient.custom) {
            await RecipeIngredient.create({
                recipeId,
                commonIngredientId: null,
                customName: ingredient.name.trim(),
                amount: ingredient.amount,
                unit: ingredient.um,
                position,
            }, {transaction});
            continue;
        }

        let common = ingredient.commonIngredientId
            ? await CommonIngredient.findByPk(ingredient.commonIngredientId, {transaction})
            : null;
        if (!common) {
            const normalizedName = normalizeIngredientName(ingredient.name);
            [common] = await CommonIngredient.findOrCreate({
                where: {normalizedName},
                defaults: {name: ingredient.name.trim(), normalizedName},
                transaction,
            });
        }

        await RecipeIngredient.create({
            recipeId,
            commonIngredientId: common.id,
            customName: null,
            amount: ingredient.amount,
            unit: ingredient.um,
            position,
        }, {transaction});
    }
}

export const recipeIncludes = [
    {
        model: RecipeIngredient,
        as: "ingredientPositions",
        include: [{model: CommonIngredient, as: "commonIngredient"}],
    },
    {
        model: User,
        as: "owner",
        attributes: ["id", "name"],
    },
];

export function serializeRecipe(recipe: Recipe): RecipeType {
    const positions = [...(recipe.ingredientPositions ?? [])].sort((a, b) => a.position - b.position);
    const ingredients: Ingredient[] = positions.length > 0
        ? positions.map((position) => ({
            id: position.id,
            name: position.commonIngredient?.name ?? position.customName ?? "",
            amount: position.amount,
            um: position.unit,
            commonIngredientId: position.commonIngredientId,
            custom: position.commonIngredientId === null,
        }))
        : recipe.ingredients.map((ingredient) => ({
            name: ingredient.name,
            amount: ingredient.amount ?? "",
            um: ingredient.um ?? "",
            commonIngredientId: ingredient.commonIngredientId ?? null,
            custom: ingredient.custom ?? !ingredient.commonIngredientId,
        }));

    return {
        id: recipe.id,
        title: recipe.title,
        description: recipe.description,
        category: recipe.category,
        ingredients,
        preparing: recipe.preparing,
        image: recipe.image,
        servings: recipe.servings,
        ownerId: recipe.ownerId,
        isPublished: recipe.isPublished,
        publishedAt: recipe.publishedAt?.toISOString() ?? null,
        author: recipe.owner ? {id: recipe.owner.id, name: recipe.owner.name} : null,
    };
}

export async function findRecipeWithDetails(id: number, transaction?: Transaction) {
    return Recipe.findByPk(id, {include: recipeIncludes, transaction});
}
