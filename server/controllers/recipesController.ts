import {Op} from "sequelize";
import type {Response} from "express";
import sequelize from "../db/sequelize";
import {Recipe, SavedRecipe} from "../models";
import type {AuthenticatedRequest} from "../middleware/auth";
import {findRecipeWithDetails, recipeIncludes, replaceRecipeIngredients, serializeRecipe} from "../services/recipes";
import {recipePatchSchema, recipeSchema} from "../validation/schemas";

const parseId = (value: string) => {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
};

export const getAllRecipes = async (req: AuthenticatedRequest, res: Response) => {
    const query = String(req.query.q ?? "").trim();
    const recipes = await Recipe.findAll({
        where: {
            isPublished: true,
            ...(query ? {title: {[Op.iLike]: `%${query}%`}} : {}),
        },
        include: recipeIncludes,
        order: [["publishedAt", "DESC"]],
    });
    return res.json(recipes.map(serializeRecipe));
};

export const getRecipe = async (req: AuthenticatedRequest, res: Response) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({error: "Некорректный id"});
    const recipe = await findRecipeWithDetails(id);
    if (!recipe) return res.sendStatus(404);
    if (!recipe.isPublished && recipe.ownerId !== req.user?.id) return res.sendStatus(404);
    return res.json(serializeRecipe(recipe));
};

export const getMyRecipes = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.sendStatus(401);
    const owned = await Recipe.findAll({
        where: {ownerId: userId},
        include: recipeIncludes,
        order: [["updatedAt", "DESC"]],
    });
    const saved = await SavedRecipe.findAll({
        where: {userId},
        include: [{model: Recipe, as: "recipe", include: recipeIncludes}],
        order: [["createdAt", "DESC"]],
    });
    return res.json({
        owned: owned.map(serializeRecipe),
        saved: saved.flatMap((row) => {
            const recipe = row.recipe;
            return recipe ? [{savedId: row.id, recipeId: row.recipeId, recipe: serializeRecipe(recipe)}] : [];
        }),
    });
};

export const createRecipe = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.sendStatus(401);
    const parsed = recipeSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({error: "Проверьте поля рецепта", details: parsed.error.flatten()});

    const recipeId = await sequelize.transaction(async (transaction) => {
        const recipe = await Recipe.create({
            ...parsed.data,
            ownerId: userId,
            isPublished: false,
        }, {transaction});
        await replaceRecipeIngredients(recipe.id, parsed.data.ingredients, transaction);
        return recipe.id;
    });
    const recipe = await findRecipeWithDetails(recipeId);
    return res.status(201).json(serializeRecipe(recipe!));
};

export const updateRecipe = async (req: AuthenticatedRequest, res: Response) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({error: "Некорректный id"});
    const parsed = recipePatchSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({error: "Проверьте поля рецепта", details: parsed.error.flatten()});
    const existing = await Recipe.findByPk(id);
    if (!existing) return res.sendStatus(404);
    if (existing.ownerId !== req.user?.id) return res.status(403).json({error: "Можно редактировать только свой рецепт"});

    await sequelize.transaction(async (transaction) => {
        await existing.update(parsed.data, {transaction});
        if (parsed.data.ingredients) {
            await replaceRecipeIngredients(existing.id, parsed.data.ingredients, transaction);
        }
    });
    const recipe = await findRecipeWithDetails(id);
    return res.json(serializeRecipe(recipe!));
};

export const deleteRecipe = async (req: AuthenticatedRequest, res: Response) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({error: "Некорректный id"});
    const recipe = await Recipe.findByPk(id);
    if (!recipe) return res.sendStatus(404);
    if (recipe.ownerId !== req.user?.id) return res.status(403).json({error: "Можно удалить только свой рецепт"});
    await recipe.destroy();
    return res.sendStatus(204);
};

export const publishRecipe = async (req: AuthenticatedRequest, res: Response) => {
    const recipe = await Recipe.findByPk(Number(req.params.id));
    if (!recipe) return res.sendStatus(404);
    if (recipe.ownerId !== req.user?.id) return res.sendStatus(403);
    await recipe.update({isPublished: true, publishedAt: new Date()});
    return res.json(serializeRecipe((await findRecipeWithDetails(recipe.id))!));
};

export const unpublishRecipe = async (req: AuthenticatedRequest, res: Response) => {
    const recipe = await Recipe.findByPk(Number(req.params.id));
    if (!recipe) return res.sendStatus(404);
    if (recipe.ownerId !== req.user?.id) return res.sendStatus(403);
    await sequelize.transaction(async (transaction) => {
        await recipe.update({isPublished: false, publishedAt: null}, {transaction});
        await SavedRecipe.destroy({
            where: {recipeId: recipe.id, userId: {[Op.ne]: req.user!.id}},
            transaction,
        });
    });
    return res.json(serializeRecipe((await findRecipeWithDetails(recipe.id))!));
};

export const savePublishedRecipe = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const recipeId = parseId(req.params.id);
    if (!userId) return res.sendStatus(401);
    if (!recipeId) return res.status(400).json({error: "Некорректный id"});
    const recipe = await Recipe.findOne({where: {id: recipeId, isPublished: true}});
    if (!recipe) return res.status(404).json({error: "Опубликованный рецепт не найден"});
    if (recipe.ownerId === userId) return res.status(400).json({error: "Собственный рецепт уже находится в коллекции"});
    const [saved, created] = await SavedRecipe.findOrCreate({where: {userId, recipeId}, defaults: {userId, recipeId}});
    return res.status(created ? 201 : 200).json(saved);
};

export const unsaveRecipe = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const recipeId = parseId(req.params.id);
    if (!userId) return res.sendStatus(401);
    if (!recipeId) return res.status(400).json({error: "Некорректный id"});
    const removed = await SavedRecipe.destroy({where: {userId, recipeId}});
    return removed ? res.sendStatus(204) : res.sendStatus(404);
};

export const cloneSavedRecipe = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const sourceId = parseId(req.params.id);
    if (!userId) return res.sendStatus(401);
    if (!sourceId) return res.status(400).json({error: "Некорректный id"});
    const saved = await SavedRecipe.findOne({where: {userId, recipeId: sourceId}});
    if (!saved) return res.status(403).json({error: "Сначала сохраните рецепт в свою коллекцию"});
    const source = await findRecipeWithDetails(sourceId);
    if (!source?.isPublished) return res.status(404).json({error: "Рецепт больше не опубликован"});
    const sourceData = serializeRecipe(source);

    const recipeId = await sequelize.transaction(async (transaction) => {
        const recipe = await Recipe.create({
            title: `${sourceData.title} (копия)`,
            description: sourceData.description,
            category: sourceData.category,
            ingredients: sourceData.ingredients,
            preparing: sourceData.preparing,
            image: sourceData.image,
            servings: sourceData.servings,
            ownerId: userId,
            isPublished: false,
        }, {transaction});
        await replaceRecipeIngredients(recipe.id, sourceData.ingredients, transaction);
        return recipe.id;
    });
    return res.status(201).json(serializeRecipe((await findRecipeWithDetails(recipeId))!));
};

export const uploadImage = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.file) return res.status(400).json({error: "Выберите изображение JPG, PNG, WebP или GIF до 5 МБ"});
    return res.status(201).json({url: `/uploads/${req.file.filename}`});
};
