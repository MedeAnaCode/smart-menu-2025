import {z} from "zod";

export const recipeFormSchema = z.object({
    title: z.string().trim().min(2, "Введите название не короче 2 символов"),
    description: z.string().trim().max(4000, "Описание слишком длинное"),
    category: z.string().trim().min(1, "Укажите категорию"),
    servings: z.number().int().min(1, "Минимум одна порция").max(100),
    preparing: z.string().trim().min(1, "Опишите этапы приготовления"),
    image: z.string().min(1),
    ingredients: z.array(z.object({
        name: z.string().trim().min(1, "Укажите ингредиент"),
        amount: z.string().trim(),
        um: z.string().trim().min(1, "Укажите единицу"),
        commonIngredientId: z.number().int().positive().nullable().optional(),
        custom: z.boolean(),
    }).superRefine((ingredient, context) => {
        if (!ingredient.custom && !ingredient.commonIngredientId) {
            context.addIssue({code: "custom", message: "Выберите ингредиент из общей базы", path: ["name"]});
        }
    })).min(1, "Добавьте хотя бы один ингредиент"),
});

export type RecipeFormValues = z.infer<typeof recipeFormSchema>;
