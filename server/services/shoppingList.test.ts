import {describe, expect, it} from "vitest";
import type {ExtraProduct, Ingredient, Meal, MenuDay, MenuRecipe, RecipeSnapshot} from "../../src/types";
import {calculateShoppingItems, scaleIngredientAmount} from "./shoppingList";

const common = (id: number, name: string, amount: string, um: string): Ingredient => ({
    name,
    amount,
    um,
    commonIngredientId: id,
    custom: false,
});

const custom = (name: string, amount: string, um: string): Ingredient => ({
    name,
    amount,
    um,
    commonIngredientId: null,
    custom: true,
});

const menuRecipe = (
    id: string,
    ingredients: Ingredient[],
    options: {servings?: number; baseServings?: number; included?: boolean} = {},
): MenuRecipe => {
    const snapshot: RecipeSnapshot = {
        originalRecipeId: 1,
        title: `Рецепт ${id}`,
        description: "",
        category: "Тест",
        ingredients,
        preparing: "Готовить",
        image: "/test.jpg",
        servings: options.baseServings ?? 2,
        authorId: 1,
        capturedAt: "2026-07-29T00:00:00.000Z",
    };
    return {
        id,
        recipeId: 1,
        servings: options.servings ?? 2,
        includeInShopping: options.included ?? true,
        recipeSnapshot: snapshot,
    };
};

const product = (id: string, name: string, included = true): ExtraProduct => ({
    id,
    name,
    amount: "1",
    um: "шт",
    includeInShopping: included,
});

const commonProduct = (id: string, commonIngredientId: number, name: string, amount: string, um: string): ExtraProduct => ({
    id,
    name,
    amount,
    um,
    includeInShopping: true,
    commonIngredientId,
    custom: false,
});

const meal = (recipes: MenuRecipe[], extraProducts: ExtraProduct[] = [], included = true): Meal => ({
    id: "00000000-0000-4000-8000-000000000010",
    title: "Обед",
    includeInShopping: included,
    recipes,
    extraProducts,
});

const day = (meals: Meal[], included = true): MenuDay => ({
    id: "00000000-0000-4000-8000-000000000020",
    date: "2026-07-29",
    title: "Среда",
    includeInShopping: included,
    meals,
});

describe("scaleIngredientAmount", () => {
    it("масштабирует количество пропорционально порциям", () => {
        expect(scaleIngredientAmount("100", 3, 2)).toBe("150");
        expect(scaleIngredientAmount("0,5", 4, 2)).toBe("1");
    });
});

describe("calculateShoppingItems", () => {
    it("объединяет общий ингредиент по id и единице", () => {
        const items = calculateShoppingItems([day([meal([
            menuRecipe("00000000-0000-4000-8000-000000000001", [common(7, "Томат", "100", "г")]),
            menuRecipe("00000000-0000-4000-8000-000000000002", [common(7, "Помидор", "50", "г")]),
        ])])]);

        expect(items).toHaveLength(1);
        expect(items[0]).toMatchObject({amount: "150", commonIngredientId: 7, sourceType: "common"});
    });

    it("не объединяет общий ингредиент с разными единицами", () => {
        const items = calculateShoppingItems([day([meal([
            menuRecipe("00000000-0000-4000-8000-000000000001", [common(7, "Томат", "100", "г")]),
            menuRecipe("00000000-0000-4000-8000-000000000002", [common(7, "Томат", "1", "шт")]),
        ])])]);

        expect(items).toHaveLength(2);
    });

    it("не объединяет кастомные ингредиенты", () => {
        const items = calculateShoppingItems([day([meal([
            menuRecipe("00000000-0000-4000-8000-000000000001", [custom("Соус", "1", "ст.л.")]),
            menuRecipe("00000000-0000-4000-8000-000000000002", [custom("Соус", "1", "ст.л.")]),
        ])])]);

        expect(items).toHaveLength(2);
        expect(items.every((item) => item.sourceType === "custom")).toBe(true);
    });

    it("не объединяет дополнительные продукты", () => {
        const items = calculateShoppingItems([day([meal([], [
            product("00000000-0000-4000-8000-000000000003", "Хлеб"),
            product("00000000-0000-4000-8000-000000000004", "Хлеб"),
        ])])]);

        expect(items).toHaveLength(2);
        expect(items.every((item) => item.sourceType === "extra")).toBe(true);
    });

    it("объединяет дополнительный продукт из общей базы с ингредиентом рецепта", () => {
        const items = calculateShoppingItems([day([meal([
            menuRecipe("00000000-0000-4000-8000-000000000001", [common(7, "Томат", "100", "г")]),
        ], [
            commonProduct("00000000-0000-4000-8000-000000000003", 7, "Томат", "50", "г"),
        ])])]);

        expect(items).toHaveLength(1);
        expect(items[0]).toMatchObject({name: "Томат", amount: "150", commonIngredientId: 7, sourceType: "common"});
    });

    it("исключает отключённые дни, приёмы пищи, рецепты и продукты", () => {
        const includedRecipe = menuRecipe(
            "00000000-0000-4000-8000-000000000001",
            [common(1, "Лук", "1", "шт")],
        );
        const excludedRecipe = menuRecipe(
            "00000000-0000-4000-8000-000000000002",
            [common(2, "Морковь", "1", "шт")],
            {included: false},
        );
        const items = calculateShoppingItems([
            day([meal([includedRecipe, excludedRecipe], [
                product("00000000-0000-4000-8000-000000000003", "Соль", false),
            ])]),
            day([meal([includedRecipe])], false),
            day([meal([includedRecipe], [], false)]),
        ]);

        expect(items).toHaveLength(1);
        expect(items[0].name).toBe("Лук");
    });
});
