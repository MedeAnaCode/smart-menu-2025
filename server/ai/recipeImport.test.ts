import {describe, expect, it} from "vitest";
import {normalizeImportedRecipe, RecipeImportService} from "./recipeImport";

describe("recipe import normalization", () => {
    it("converts kg and l exactly and preserves preparation text", () => {
        const preparing = "Добавьте 1,5 кг муки.\nВлейте 2 л воды.";
        const draft = normalizeImportedRecipe({
            title: "Тесто", description: "", preparing, servings: 4, servingsSource: "explicit",
            ingredients: [{name: "Мука", amount: "1.5", unit: "кг"}, {name: "Вода", amount: 2, unit: "л"}],
        });
        expect(draft.ingredients).toMatchObject([{amount: "1500", um: "г"}, {amount: "2000", um: "мл"}]);
        expect(draft.preparing).toBe(preparing);
    });

    it("keeps an unsupported source measure visible in the warning", () => {
        const draft = normalizeImportedRecipe({
            title: "Салат", description: "", preparing: "Добавьте пучок укропа.", servings: 2,
            ingredients: [{name: "Укроп", amount: 1, unit: "пучок"}],
        });
        expect(draft.ingredients[0]).toMatchObject({amount: "", um: "по вкусу", needsReview: true});
        expect(draft.ingredients[0].warning).toContain("1 пучок");
    });

    it("marks absent servings as an AI estimate", async () => {
        const service = new RecipeImportService({parseRecipe: async () => ({
            title: "Омлет", description: "", preparing: "Взбейте яйца.", servings: 2,
            ingredients: [{name: "Яйца", amount: 4, unit: "шт"}],
        })});
        await expect(service.importRecipe("Достаточно длинный текст рецепта для проверки")).resolves.toMatchObject({servingsSource: "estimated"});
    });
});
