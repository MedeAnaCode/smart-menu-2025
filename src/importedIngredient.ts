import type {CommonIngredient} from "./types";
import type {RecipeImportDraft} from "./apiRtk";
import type {RecipeFormValues} from "./validation/recipe";

const normalizedName = (name: string) => name.trim().toLocaleLowerCase("ru-RU");

export function toFormIngredient(
    item: RecipeImportDraft["ingredients"][number],
    commonIngredients: CommonIngredient[],
): RecipeFormValues["ingredients"][number] {
    const common = commonIngredients.find(candidate => normalizedName(candidate.name) === normalizedName(item.name));
    return {
        name: common?.name ?? item.name,
        amount: item.amount,
        um: item.um,
        commonIngredientId: common?.id ?? null,
        custom: !common,
    };
}
