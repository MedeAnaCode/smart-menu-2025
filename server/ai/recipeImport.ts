import {z} from "zod";

export const recipeImportUnits = ["г", "кг", "мл", "л", "шт", "ч.л.", "ст.л.", "по вкусу"] as const;
export type RecipeImportUnit = typeof recipeImportUnits[number];

export const recipeImportRequestSchema = z.object({
    text: z.string().trim().min(20, "Вставьте рецепт целиком (не менее 20 символов)").max(40_000),
});

const providerIngredientSchema = z.object({
    name: z.string().trim().min(1).max(255),
    amount: z.union([z.number(), z.string(), z.null()]),
    unit: z.string().trim().max(50).nullish(),
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
    "г": "г", "гр": "г", "гр.": "г", "грамм": "г", "грамма": "г", "граммов": "г",
    "кг": "кг", "килограмм": "кг", "килограмма": "кг", "килограммов": "кг",
    "мл": "мл", "миллилитр": "мл", "миллилитра": "мл", "миллилитров": "мл",
    "л": "л", "литр": "л", "литра": "л", "литров": "л",
    "шт": "шт", "шт.": "шт", "штука": "шт", "штуки": "шт", "штук": "шт",
    "ч.л.": "ч.л.", "ч. л.": "ч.л.", "чайная ложка": "ч.л.", "чайные ложки": "ч.л.",
    "ч. ложка": "ч.л.", "ч. ложки": "ч.л.", "ч. ложек": "ч.л.", "чайной ложки": "ч.л.", "чайных ложек": "ч.л.",
    "ст.л.": "ст.л.", "ст. л.": "ст.л.", "столовая ложка": "ст.л.", "столовые ложки": "ст.л.",
    "ст. ложка": "ст.л.", "ст. ложки": "ст.л.", "ст. ложек": "ст.л.", "столовой ложки": "ст.л.", "столовых ложек": "ст.л.",
    "по вкусу": "по вкусу",
};

function parseAmount(value: string | number | null): number | null {
    if (typeof value === "number") return Number.isFinite(value) && value >= 0 ? value : null;
    if (!value) return null;
    const normalized = value.replace(",", ".").trim();
    const numeric = Number(normalized);
    return /^\d+(?:\.\d+)?$/.test(normalized) && Number.isFinite(numeric) ? numeric : null;
}

function displayAmount(value: number) {
    return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(3)));
}

function garlicCloveAmount(value: string | number | null): number | null {
    const numeric = parseAmount(value);
    if (numeric !== null || typeof value !== "string") return numeric;
    const range = /^\s*(\d+)\s*[-–—]\s*(\d+)\s*$/.exec(value);
    if (!range) return null;
    const lower = Math.min(Number(range[1]), Number(range[2]));
    return Number.isFinite(lower) ? lower : null;
}

/** Converts metric units exactly and countable garlic cloves to pieces using the requested lower range bound. */
export function normalizeImportedRecipe(recipe: ProviderRecipe): RecipeImportDraft {
    const warnings: string[] = [];
    const ingredients = recipe.ingredients.map((ingredient) => {
        const rawUnit = (ingredient.unit ?? "").toLowerCase().replace(/\s+/g, " ").trim();
        const isGarlicClove = /чеснок/iu.test(ingredient.name) && (
            /^(?:зубчик|зубчика|зубчики|зубчиков)$/u.test(rawUnit)
            || (unitAliases[rawUnit] === "шт" && /зубчик/iu.test(ingredient.name))
        );
        const name = isGarlicClove ? "Зубчик чеснока" : ingredient.name;
        const knownUnit = isGarlicClove ? "шт" : rawUnit ? unitAliases[rawUnit] : "по вкусу";
        const numericAmount = isGarlicClove ? garlicCloveAmount(ingredient.amount) : parseAmount(ingredient.amount);
        const rawAmount = ingredient.amount === null || String(ingredient.amount).trim() === "" ? "не указано" : String(ingredient.amount);
        const explicitToTaste = knownUnit === "по вкусу" && (ingredient.amount === null || String(ingredient.amount).trim() === "" || String(ingredient.amount).trim().toLowerCase() === "по вкусу");
        let um: RecipeImportUnit = knownUnit ?? "по вкусу";
        let amount = numericAmount === null ? "" : displayAmount(numericAmount);
        let needsReview = Boolean(ingredient.needsReview) && !(isGarlicClove && numericAmount !== null);
        const messages = ingredient.warning?.trim() ? [ingredient.warning.trim()] : [];
        const sourceMeasure = `${rawAmount} ${ingredient.unit?.trim() || "(единица не указана)"}`;

        if (knownUnit === "кг" && numericAmount !== null) {
            um = "г";
            amount = displayAmount(numericAmount * 1000);
        } else if (knownUnit === "л" && numericAmount !== null) {
            um = "мл";
            amount = displayAmount(numericAmount * 1000);
        } else if (!knownUnit && !explicitToTaste) {
            needsReview = true;
            // The editable field must use an existing unit, but the original measure must remain visible.
            messages.push(`Исходная мера: ${sourceMeasure}. Выберите подходящую единицу и количество.`);
        }

        if (um === "по вкусу") amount = "";
        if (numericAmount === null && um !== "по вкусу") {
            needsReview = true;
            messages.push(`Исходное количество: ${sourceMeasure}. Заполните количество вручную.`);
        }
        if (knownUnit === "по вкусу" && !explicitToTaste) {
            needsReview = true;
            messages.push(`Исходная мера: ${sourceMeasure}. Проверьте единицу и количество.`);
        }
        if (needsReview && messages.length === 0) messages.push("Проверьте ингредиент и его количество по исходному рецепту.");
        const warning = messages.join(" ") || undefined;
        needsReview = needsReview || Boolean(warning);
        if (needsReview && warning) warnings.push(`${name}: ${warning}`);
        return {name, amount, um, needsReview, warning};
    });

    const servingsSource = recipe.servingsSource ?? "estimated";
    if (servingsSource === "estimated") warnings.unshift("Количество порций — оценка ИИ. При необходимости измените.");
    return {title: recipe.title, description: recipe.description, preparing: recipe.preparing, servings: recipe.servings, servingsSource, ingredients, warnings};
}

/** A standalone preparation heading gives us a reliable source boundary without asking the model to rewrite steps. */
function extractSourcePreparation(text: string): string | undefined {
    const heading = /^[ \t]*(?:Приготовление|Способ приготовления)[ \t]*:?[ \t]*(?:(?:https?:\/\/)?(?:[\w-]+\.)+[a-z]{2,}(?:\/\S*)?)?[ \t]*\r?$/im.exec(text);
    if (!heading) return undefined;
    return text.slice(heading.index + heading[0].length).trim() || undefined;
}

function comparableText(text: string): string {
    return text.replace(/\s+/g, " ").trim();
}

export class RecipeImportService {
    constructor(private readonly provider: RecipeAiProvider) {}

    async importRecipe(text: string): Promise<RecipeImportDraft> {
        const rawResult = await this.provider.parseRecipe(text);
        const sourcePreparation = extractSourcePreparation(text);
        let candidate = rawResult;
        if (sourcePreparation && rawResult && typeof rawResult === "object" && !Array.isArray(rawResult)) {
            const result = rawResult as Record<string, unknown>;
            const descriptionDuplicatesPreparation = typeof result.description === "string" && (
                comparableText(result.description) === comparableText(sourcePreparation)
                || (typeof result.preparing === "string" && comparableText(result.description) === comparableText(result.preparing))
            );
            candidate = {...result, preparing: sourcePreparation, ...(descriptionDuplicatesPreparation ? {description: ""} : {})};
        }
        const parsed = providerRecipeSchema.safeParse(candidate);
        if (!parsed.success) {
            console.error("Recipe import validation failed", parsed.error.issues.map(({path, code}) => ({path, code})));
            throw new Error("ИИ вернул неполные данные рецепта. Попробуйте ещё раз или заполните форму вручную.");
        }
        return normalizeImportedRecipe(parsed.data);
    }
}
