import {randomUUID} from "node:crypto";
import type {Ingredient, MenuDay, ShoppingListItem} from "../../src/types";

export const scaleIngredientAmount = (amount: string, servings: number, baseServings: number) => {
    const numeric = Number(amount.replace(",", "."));
    if (!Number.isFinite(numeric)) return amount;
    return String(Number((numeric * servings / Math.max(baseServings, 1)).toFixed(2)));
};

export function calculateShoppingItems(days: MenuDay[]): ShoppingListItem[] {
    const groupedCommon = new Map<string, ShoppingListItem>();
    const result: ShoppingListItem[] = [];

    const addItem = (item: ShoppingListItem, isCommon: boolean) => {
        if (!isCommon || !item.commonIngredientId) {
            result.push(item);
            return;
        }

        const key = `${item.commonIngredientId}::${item.um.trim().toLocaleLowerCase("ru-RU")}`;
        const existing = groupedCommon.get(key);
        const numericAmount = Number(item.amount);
        if (existing && Number.isFinite(numericAmount) && Number.isFinite(Number(existing.amount))) {
            existing.amount = String(Number((Number(existing.amount) + numericAmount).toFixed(2)));
            if (existing.source !== item.source) existing.source = "Несколько источников";
            return;
        }
        if (!existing) groupedCommon.set(key, item);
        result.push(item);
    };

    const addRecipeIngredient = (
        ingredient: Ingredient,
        selectedServings: number,
        baseServings: number,
        source: string,
    ) => {
        const amount = scaleIngredientAmount(ingredient.amount, selectedServings, baseServings);
        const isCommon = !ingredient.custom && Boolean(ingredient.commonIngredientId);
        const item: ShoppingListItem = {
            id: randomUUID(),
            name: ingredient.name,
            amount,
            um: ingredient.um,
            source,
            sourceType: isCommon ? "common" : "custom",
            commonIngredientId: ingredient.commonIngredientId ?? null,
            checked: false,
            manual: false,
        };

        addItem(item, isCommon);
    };

    for (const day of days) {
        if (!day.includeInShopping) continue;
        for (const meal of day.meals) {
            if (!meal.includeInShopping) continue;
            for (const menuRecipe of meal.recipes) {
                if (!menuRecipe.includeInShopping) continue;
                for (const ingredient of menuRecipe.recipeSnapshot.ingredients) {
                    addRecipeIngredient(
                        ingredient,
                        menuRecipe.servings,
                        menuRecipe.recipeSnapshot.servings,
                        menuRecipe.recipeSnapshot.title,
                    );
                }
            }
            for (const product of meal.extraProducts) {
                if (!product.includeInShopping) continue;
                const isCommon = product.custom === false && Boolean(product.commonIngredientId);
                addItem({
                    id: randomUUID(),
                    name: product.name,
                    amount: product.amount,
                    um: product.um,
                    source: meal.title,
                    sourceType: isCommon ? "common" : "extra",
                    commonIngredientId: product.commonIngredientId ?? null,
                    checked: false,
                    manual: false,
                }, isCommon);
            }
        }
    }

    return result;
}
