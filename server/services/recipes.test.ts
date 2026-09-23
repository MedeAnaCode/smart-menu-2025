import {describe, expect, it} from "vitest";
import {serializeRecipe} from "./recipes";

describe("serializeRecipe", () => {
    it("returns names, quantities, units, and provenance from normalized ingredient positions", () => {
        const recipe = serializeRecipe({
            id: 37,
            title: "Шакшука",
            description: "Классический рецепт",
            category: "Домашнее",
            ingredients: [],
            preparing: "Приготовить.",
            image: "/img/shakshuka.jpg",
            servings: 1,
            ownerId: 10,
            isPublished: false,
            publishedAt: null,
            ingredientPositions: [
                {id: 41, position: 0, commonIngredientId: 38, customName: null, amount: "4", unit: "шт", commonIngredient: {name: "Яйца"}},
                {id: 44, position: 1, commonIngredientId: null, customName: "Красный сладкий перец", amount: "1", unit: "шт"},
                {id: 42, position: 2, commonIngredientId: 11, customName: null, amount: "400", unit: "г", commonIngredient: {name: "Помидоры"}},
            ],
            owner: {id: 10, name: "Mede Ana"},
        });

        expect(recipe.ingredients).toEqual([
            {id: 41, name: "Яйца", amount: "4", um: "шт", commonIngredientId: 38, custom: false},
            {id: 44, name: "Красный сладкий перец", amount: "1", um: "шт", commonIngredientId: null, custom: true},
            {id: 42, name: "Помидоры", amount: "400", um: "г", commonIngredientId: 11, custom: false},
        ]);
        expect(recipe.author).toEqual({id: 10, name: "Mede Ana"});
    });
});
