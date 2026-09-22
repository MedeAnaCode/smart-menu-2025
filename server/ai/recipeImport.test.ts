import {readFileSync} from "node:fs";
import {describe, expect, it, vi} from "vitest";
import {normalizeImportedRecipe, RecipeImportService} from "./recipeImport";

describe("recipe import normalization", () => {
    it("preserves quantities for abbreviated units with trailing periods", () => {
        const draft = normalizeImportedRecipe({
            title: "Омлет", description: "", preparing: "Взбейте яйца с молоком и добавьте масло.", servings: 2, servingsSource: "explicit",
            ingredients: [
                {name: "Яйца", amount: 4, unit: "шт.", warning: ""},
                {name: "Молоко", amount: 100, unit: "мл", warning: ""},
                {name: "Масло", amount: 10, unit: "гр.", warning: ""},
            ],
        });
        expect(draft.ingredients).toMatchObject([
            {amount: "4", um: "шт", needsReview: false},
            {amount: "100", um: "мл", needsReview: false},
            {amount: "10", um: "г", needsReview: false},
        ]);
        expect(draft.warnings).toEqual([]);
    });

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

    it.each(["", "   "])("keeps fallback warnings when the provider warning is %j", (warning) => {
        const draft = normalizeImportedRecipe({
            title: "Салат", description: "", preparing: "Нарежьте укроп и добавьте масло.", servings: 2, servingsSource: "explicit",
            ingredients: [
                {name: "Укроп", amount: 1, unit: "пучок", needsReview: true, warning},
                {name: "Масло", amount: null, unit: "мл", needsReview: true, warning},
            ],
        });
        expect(draft.ingredients[0].warning).toContain("1 пучок");
        expect(draft.ingredients[1].warning).toContain("не указано мл");
        expect(draft.warnings).toHaveLength(2);
    });
});

const shakshukaText = readFileSync(new URL("./fixtures/shakshuka.txt", import.meta.url), "utf8");
// Regression fixture reproduces the empty measures and incomplete model preparation from the live failure.
const shakshukaProviderResult = JSON.parse(readFileSync(new URL("./fixtures/shakshuka-provider.json", import.meta.url), "utf8"));
const sourcePreparation = shakshukaText.split("Приготовление: koolinar.ru")[1].trim();

describe("recipe import source regression", () => {
    it("imports the user's shakshuka with all six source steps and existing units", async () => {
        const service = new RecipeImportService({parseRecipe: async () => shakshukaProviderResult});
        const draft = await service.importRecipe(shakshukaText);
        expect(draft.preparing).toBe(sourcePreparation);
        expect(draft.preparing.split(/\r?\n/).filter((line) => line.trim())).toHaveLength(6);
        expect(draft.preparing).toContain("томатная паста — 2–3 ст. л..");
        expect(draft.preparing).toContain("около 5–7 минут");
        expect(draft.preparing).toContain("Украсить её свежей нарезанной зеленью.");
        expect(draft.description).toBe("");
        expect(draft.servingsSource).toBe("estimated");
        expect(draft.ingredients[4]).toMatchObject({name: "Зубчик чеснока", amount: "2", um: "шт", needsReview: false});
        expect(draft.ingredients[4].warning).toBeUndefined();
        for (const index of [5, 9, 10]) {
            expect(draft.ingredients[index]).toMatchObject({amount: "", um: "по вкусу", needsReview: false});
        }
        expect(draft.ingredients[8]).toMatchObject({amount: "0.5", um: "ч.л.", needsReview: true, warning: "по желанию"});
        expect(draft.warnings).toContain("Острый перец: по желанию");
    });

    it.each(["", "   ", null, undefined])("defaults a %j unit to taste without fabricating a quantity", async (unit) => {
        const service = new RecipeImportService({parseRecipe: async () => ({...shakshukaProviderResult,
            ingredients: [{name: "Масло", amount: null, unit}],
        })});
        const draft = await service.importRecipe("Приготовление:\nДобавить масло.");
        expect(draft.ingredients[0]).toEqual({name: "Масло", amount: "", um: "по вкусу", needsReview: false, warning: undefined});
    });

    it.each([2, "2–3"])("keeps quantity %j visible when its unit is missing", async (amount) => {
        const service = new RecipeImportService({parseRecipe: async () => ({...shakshukaProviderResult,
            ingredients: [{name: "Чеснок", amount, unit: ""}],
        })});
        const draft = await service.importRecipe(shakshukaText);
        expect(draft.ingredients[0]).toMatchObject({amount: "", um: "по вкусу", needsReview: true});
        expect(draft.ingredients[0].warning).toContain(String(amount));
        expect(draft.ingredients[0].warning).toContain("единица не указана");
    });

    it("preserves a separate description and uses source even when model preparation is empty", async () => {
        const description = "Классический завтрак из яиц и овощей.";
        const service = new RecipeImportService({parseRecipe: async () => ({...shakshukaProviderResult, description, preparing: ""})});
        const draft = await service.importRecipe(shakshukaText);
        expect(draft.preparing).toBe(sourcePreparation);
        expect(draft.description).toBe(description);
    });

    it.each(["Омлет. Взбить яйца.", "Приготовление займёт 20 минут.\nВзбить яйца.", "Приготовление: \n  "])("keeps the model preparation without an unambiguous nonempty source section: %s", async (text) => {
        const service = new RecipeImportService({parseRecipe: async () => shakshukaProviderResult});
        const draft = await service.importRecipe(text);
        expect(draft.preparing).toBe(shakshukaProviderResult.preparing);
    });

    it("validates the final source length and logs only validation paths and codes", async () => {
        const error = vi.spyOn(console, "error").mockImplementation(() => {});
        try {
            const service = new RecipeImportService({parseRecipe: async () => shakshukaProviderResult});
            await expect(service.importRecipe(`Приготовление:\n${"x".repeat(10001)}`)).rejects.toThrow("ИИ вернул неполные данные рецепта");
            expect(error).toHaveBeenCalledWith("Recipe import validation failed", [{path: ["preparing"], code: "too_big"}]);
        } finally {
            error.mockRestore();
        }
    });

    it("appends original unsupported measures to an existing provider warning", () => {
        const draft = normalizeImportedRecipe({...shakshukaProviderResult,
            ingredients: [{name: "Укроп", amount: "2–3", unit: "пучка", needsReview: false, warning: "Количество зависит от размера"}],
        });
        expect(draft.ingredients[0].warning).toContain("Количество зависит от размера");
        expect(draft.ingredients[0].warning).toContain("2–3 пучка");
        expect(draft.warnings[1]).toContain("2–3 пучка");
    });

    it.each(["зубчик", "зубчика", "зубчики", "зубчиков"])("converts countable garlic %s to pieces using the lower bound", (unit) => {
        const draft = normalizeImportedRecipe({...shakshukaProviderResult,
            ingredients: [{name: "Чеснок", amount: "2–3", unit, needsReview: true}],
        });
        expect(draft.ingredients[0]).toEqual({name: "Зубчик чеснока", amount: "2", um: "шт", needsReview: false, warning: undefined});
    });

    it("handles already named garlic cloves while keeping gram ranges for review", () => {
        const draft = normalizeImportedRecipe({...shakshukaProviderResult, ingredients: [
            {name: "Зубчик чеснока", amount: "2-3", unit: "шт"},
            {name: "Чеснок", amount: "2–3", unit: "г"},
            {name: "Чеснок", amount: 1, unit: "головка"},
        ]});
        expect(draft.ingredients[0]).toMatchObject({name: "Зубчик чеснока", amount: "2", um: "шт", needsReview: false});
        expect(draft.ingredients[1]).toMatchObject({name: "Чеснок", amount: "", um: "г", needsReview: true});
        expect(draft.ingredients[1].warning).toContain("2–3 г");
        expect(draft.ingredients[2]).toMatchObject({name: "Чеснок", amount: "", um: "по вкусу", needsReview: true});
        expect(draft.ingredients[2].warning).toContain("1 головка");
    });

    it.each(["ч. ложка", "ч. ложки", "ч. ложек", "ст. ложка", "ст. ложки", "ст. ложек"])("recognizes the spoon alias %s", (unit) => {
        const draft = normalizeImportedRecipe({...shakshukaProviderResult, ingredients: [{name: "Паприка", amount: "0,5", unit}]});
        expect(draft.ingredients[0]).toMatchObject({amount: "0.5", um: unit.startsWith("ч.") ? "ч.л." : "ст.л.", needsReview: false});
    });
});
