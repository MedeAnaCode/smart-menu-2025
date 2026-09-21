import type {Response} from "express";
import {RecipeImportService, recipeImportRequestSchema} from "../ai/recipeImport";
import {YandexRecipeAiProvider} from "../ai/yandexRecipeAiProvider";
import type {AuthenticatedRequest} from "../middleware/auth";

const recipeImportService = new RecipeImportService(new YandexRecipeAiProvider());

export async function importRecipe(req: AuthenticatedRequest, res: Response) {
    const request = recipeImportRequestSchema.safeParse(req.body);
    if (!request.success) return res.status(400).json({error: "Вставьте рецепт для разбора", details: request.error.flatten()});
    try { return res.json(await recipeImportService.importRecipe(request.data.text)); }
    catch (error) { const message = error instanceof Error ? error.message : "Не удалось разобрать рецепт."; return res.status(message.includes("ещё не настроена") ? 503 : 422).json({error: message}); }
}
