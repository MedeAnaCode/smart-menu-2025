import {z} from "zod";

export const ingredientSchema = z.object({
    name: z.string().trim().min(1, "Укажите название ингредиента").max(255),
    amount: z.string().trim().max(50),
    um: z.string().trim().min(1, "Укажите единицу измерения").max(50),
    commonIngredientId: z.number().int().positive().nullable().optional(),
    custom: z.boolean(),
});

export const recipeSchema = z.object({
    title: z.string().trim().min(2, "Название должно содержать минимум 2 символа").max(255),
    description: z.string().trim().max(4000).default(""),
    category: z.string().trim().min(1, "Укажите категорию").max(100),
    ingredients: z.array(ingredientSchema).min(1, "Добавьте хотя бы один ингредиент"),
    preparing: z.string().trim().min(1, "Опишите приготовление").max(10000),
    image: z.string().trim().min(1).max(1000),
    servings: z.number().int().min(1).max(100),
});

export const recipePatchSchema = recipeSchema.partial().refine(
    (value) => Object.keys(value).length > 0,
    "Пустое обновление",
);

export const menuRecipeSchema = z.object({
    id: z.string().uuid(),
    recipeId: z.number().int().positive(),
    servings: z.number().int().min(1).max(100),
    includeInShopping: z.boolean(),
    recipeSnapshot: z.object({
        originalRecipeId: z.number().int().positive(),
        title: z.string(),
        description: z.string(),
        category: z.string(),
        ingredients: z.array(ingredientSchema),
        preparing: z.string(),
        image: z.string(),
        servings: z.number().int().positive(),
        authorId: z.number().int().positive().nullable(),
        capturedAt: z.string(),
    }),
});

export const extraProductSchema = z.object({
    id: z.string().uuid(),
    name: z.string().trim().min(1).max(255),
    amount: z.string().trim().max(50),
    um: z.string().trim().min(1).max(50),
    includeInShopping: z.boolean(),
    commonIngredientId: z.number().int().positive().nullable().optional(),
    custom: z.boolean().optional(),
}).superRefine((product, context) => {
    if (product.custom === false && !product.commonIngredientId) {
        context.addIssue({code: "custom", message: "Выберите продукт из общей базы"});
    }
});

export const mealSchema = z.object({
    id: z.string().uuid(),
    title: z.string().trim().min(1).max(100),
    includeInShopping: z.boolean(),
    recipes: z.array(menuRecipeSchema),
    extraProducts: z.array(extraProductSchema),
});

export const menuDaySchema = z.object({
    id: z.string().uuid(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Некорректная дата").refine((value) => {
        const date = new Date(`${value}T12:00:00Z`);
        return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
    }, "Некорректная дата"),
    title: z.string().trim().min(1).max(100),
    includeInShopping: z.boolean(),
    meals: z.array(mealSchema),
    comment: z.string().trim().max(2000).optional(),
});

export const shoppingListItemSchema = z.object({
    id: z.string().uuid(),
    name: z.string().trim().min(1).max(255),
    amount: z.string().trim().max(50),
    um: z.string().trim().max(50),
    source: z.string().max(255),
    sourceType: z.enum(["common", "custom", "extra", "manual"]),
    commonIngredientId: z.number().int().positive().nullable().optional(),
    checked: z.boolean(),
    manual: z.boolean(),
});
