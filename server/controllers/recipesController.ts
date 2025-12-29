import {Request, Response} from "express";
import RecipeModel from "../models/recipe";
import type { Recipe as RecipeType, RecipeCreation, EditableFields } from './../../src/types/index';

const getAllRecipes = async (req: Request, res: Response) => { //контроллер, асинхронная функция, которая обрабатывает входящий http-запрос req, res - объект для ответа клиенту
    try {
        const recipes = await RecipeModel.findAll(); // обращаемся к БД за рецептами
        res.json(recipes); //добавляем в объект ответа json из массива с рецептами
    } catch (err: unknown) {
        console.error("Ошибка при получении рецептов:", err);
        res.status(500).json({ error: "Ошибка сервера" });
    }
};

const createRecipe = async (req: Request, res: Response) => {
    try {
        const { title, ingredients, preparing, image, servings }: RecipeCreation = req.body;
        const recipe = await RecipeModel.create({
            title,
            ingredients,
            preparing,
            image,
            servings
        });
        res.status(201).json(recipe); //201 - ресурс был успешно создан
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка при создании рецепта' });
    }
};

const deleteRecipe = async (req: Request, res: Response) => {
    const currentId: number = Number(req.params.id);

    if (isNaN(currentId) || !Number.isInteger(currentId) || currentId <= 0) {
        return res.status(400).json({ error: "Некорректный id" });
    }

    try {
        await RecipeModel.destroy({
            where: {
                id: currentId,
            },
        });

        res.sendStatus(204);
    } catch (err: unknown) {
        console.error(err);
        res.status(500).json({ error: "Ошибка сервера" });
    }
};

const updateRecipe = async (req: Request, res: Response) => {
    const ALLOWED: EditableFields[] = ['title','ingredients','preparing','image','servings'];

    const id: number = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Некорректный id' });

    const updates: Partial<Pick<RecipeType, EditableFields>> = {};
    for (const k of ALLOWED) if (k in req.body) updates[k] = req.body[k];
    if ('servings' in updates) updates.servings = Number(updates.servings);
    if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'Пустое обновление' });

    try {
        const recipe = await RecipeModel.findByPk(id);
        if (!recipe) return res.status(404).json({ error: 'Не найдено' });

        await recipe.update(updates as Partial<RecipeType>);
        return res.status(200).json(recipe);
    } catch (err: unknown) {
        console.error(err);
        return res.status(500).json({ error: 'Ошибка при обновлении рецепта' });
    }
};

export default {
    getAllRecipes,
    createRecipe,
    deleteRecipe,
    updateRecipe
};
