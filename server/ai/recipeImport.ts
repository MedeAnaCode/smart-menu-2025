import {z} from "zod";

export const recipeImportUnits = ["г", "кг", "мл", "л", "шт", "ч.л.", "ст.л.", "по вкусу"] as const;
export type RecipeImportUnit = typeof recipeImportUnits[number];

export const recipeImportRequestSchema = z.object({
    text: z.string().trim().min(20, "Вставьте рецепт целиком (не менее 20 символов)").max(40_000),
});

const providerIngredientSchema = z.object({
    name: z.string().trim().min(1).max(255),
    amount: z.union([z.number(), z.string(), z.null()]),
    unit: z.string().trim().min(1).max(50),
    needsReview: z.boolean().optional(),
    warning: z.string().trim().max(300).optional(),
});

export const providerRecipeSchema = z.object({
    title: z.string().trim().min(2).max(255),
    description: z.string().trim().max(4000).optional().default(""),
    preparing: z.string().trim().min(1).max(10_000),
    servings: z.number().int().min(1).max(100),
    servingsSource: z.enum(["explicit", "estimated"]).optional(),
    ingredients: z.array(providerIngredientSchema).min(1).max(100),
});

export type ProviderRecipe = z.infer<typeof providerRecipeSchema>;
export type RecipeAiProvider = {parseRecipe(text: string): Promise<unknown>};

export type RecipeImportDraft = {
    title: string;
    description: string;
    preparing: string;
    servings: number;
    servingsSource: "explicit" | "estimated";
    ingredients: Array<{
        name: string;
        amount: string;
        um: RecipeImportUnit;
        needsReview: boolean;
        warning?: string;
    }>;
    warnings: string[];
};

const unitAliases: Record<string, RecipeImportUnit> = {
    "г": "г", "гр": "г", "грамм": "г", "грамма": "г", "граммов": "г",
    "кг": "кг", "килограмм": "кг", "килограмма": "кг", "килограммов": "кг",
    "мл": "мл", "миллилитр": "мл", "миллилитра": "мл", "миллилитров": "мл",
    "л": "л", "литр": "л", "литра": "л", "литров": "л",
    "шт": "шт", "штука": "шт", "штуки": "шт", "штук": "шт",
    "ч.л.": "ч.л.", "ч. л.": "ч.л.", "чайная ложка": "ч.л.", "чайные ложки": "ч.л.",
    "ст.л.": "ст.л.", "ст. л.": "ст.л.", "столовая ложка": "ст.л.", "столовые ложки": "ст.л.",
    "по вкусу": "по вкусу",
};

function parseAmount(value: string | number | null): number | null {
    if (typeof value === "number") return Number.isFinite(value) && value >= 0 ? value : null;
    if (!value) return null;
    const normalized = value.replace(",", ".").trim();
    return /^\d+(?:\.\d+)?$/.test(normalized) ? Number(normalized) : null;
}

function displayAmount(value: number) {
    return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(3)));
}

/** Canonicalizes only lossless metric conversions; it never guesses densities or household measures. */
export function normalizeImportedRecipe(recipe: ProviderRecipe): RecipeImportDraft {
    const warnings: string[] = [];
    const ingredients = recipe.ingredients.map((ingredient) => {
        const rawUnit = ingredient.unit.toLowerCase().replace(/\s+/g, " ").trim();
        const knownUnit = unitAliases[rawUnit];
        const numericAmount = parseAmount(ingredient.amount);
        const rawAmount = ingredient.amount === null ? "не указано" : String(ingredient.amount);
        let um: RecipeImportUnit = knownUnit ?? "по вкусу";
        let amount = numericAmount === null ? "" : displayAmount(numericAmount);
        let needsReview = Boolean(ingredient.needsReview);
        let warning = ingredient.warning;

        if (knownUnit === "кг" && numericAmount !== null) {
            um = "г";
            amount = displayAmount(numericAmount * 1000);
        } else if (knownUnit === "л" && numericAmount !== null) {
            um = "мл";
            amount = displayAmount(numericAmount * 1000);
        } else if (!knownUnit) {
            needsReview = true;
            // The editable field must use an existing unit, but the original measure must remain visible.
            warning = warning ?? `Исходная мера: ${rawAmount} ${ingredient.unit}. Выберите подходящую единицу и количество.`;
        }

        if (um === "по вкусу") amount = "";
        if (numericAmount === null && um !== "по вкусу") {
            needsReview = true;
            warning = warning ?? `Исходное количество: ${rawAmount} ${ingredient.unit}. Заполните количество вручную.`;
        }
        if (needsReview && warning) warnings.push(`${ingredient.name}: ${warning}`);
        return {name: ingredient.name, amount, um, needsReview, warning};
    });

    const servingsSource = recipe.servingsSource ?? "estimated";
    if (servingsSource === "estimated") warnings.unshift("Количество порций — оценка ИИ. При необходимости измените.");
    return {title: recipe.title, description: recipe.description, preparing: recipe.preparing, servings: recipe.servings, servingsSource, ingredients, warnings};
}

export class RecipeImportService {
    constructor(private readonly provider: RecipeAiProvider) {}

    async importRecipe(text: string): Promise<RecipeImportDraft> {
        const rawResult = await this.provider.parseRecipe(text);
        const parsed = providerRecipeSchema.safeParse(rawResult);
        if (!parsed.success) throw new Error("ИИ вернул неполные данные рецепта. Попробуйте ещё раз или заполните форму вручную.");
        return normalizeImportedRecipe(parsed.data);
    }
}
