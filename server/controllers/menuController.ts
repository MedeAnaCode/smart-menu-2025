import {randomUUID} from "node:crypto";
import type {Response} from "express";
import {Op} from "sequelize";
import {CommonIngredient, ShoppingList, WeeklyMenu} from "../models";
import type {AuthenticatedRequest} from "../middleware/auth";
import type {ExtraProduct, Meal, MenuDay, MenuRecipe, RecipeSnapshot} from "../../src/types";
import {calculateShoppingItems} from "../services/shoppingList";
import {findRecipeWithDetails, serializeRecipe} from "../services/recipes";
import {extraProductSchema, menuDaySchema, shoppingListItemSchema} from "../validation/schemas";
import {z} from "zod";

const menuPatchSchema = z.object({
    title: z.string().trim().min(1).max(255).optional(),
    description: z.string().trim().max(4000).optional(),
    // A menu is a continuous planning period, not necessarily a calendar week.
    days: z.array(menuDaySchema).min(1).max(366).optional(),
}).refine((value) => Object.keys(value).length > 0, "Пустое обновление");

const defaultDays = (): MenuDay[] => {
    const today = new Date();
    const mondayOffset = (today.getDay() + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - mondayOffset);

    return ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"].map((title, index) => {
        const date = new Date(monday);
        date.setDate(monday.getDate() + index);
        return {
            id: randomUUID(),
            date: date.toISOString().slice(0, 10),
            title,
            includeInShopping: true,
            meals: ["Завтрак", "Обед", "Перекус", "Ужин"].map((mealTitle) => ({
                id: randomUUID(),
                title: mealTitle,
                includeInShopping: true,
                recipes: [],
                extraProducts: [],
            })),
            comment: "",
        };
    });
};

async function findMenu(req: AuthenticatedRequest, res: Response) {
    const id = Number(req.params.menuId ?? req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({error: "Некорректный id меню"});
        return null;
    }
    const menu = await WeeklyMenu.findByPk(id);
    if (!menu) {
        res.sendStatus(404);
        return null;
    }
    if (menu.userId !== req.user?.id) {
        res.sendStatus(403);
        return null;
    }
    return menu;
}

function isContinuousDays(days: MenuDay[]) {
    return days.every((day, index) => {
        if (index === 0) return true;
        const previous = new Date(`${days[index - 1].date}T12:00:00`);
        const current = new Date(`${day.date}T12:00:00`);
        return Number.isFinite(previous.getTime()) && Number.isFinite(current.getTime())
            && Math.round((current.getTime() - previous.getTime()) / 86_400_000) === 1;
    });
}

function hasValidPeriodShape(currentDays: MenuDay[], requestedDays: MenuDay[]) {
    const currentIndex = new Map(currentDays.map((day, index) => [day.id, index]));
    const retained = requestedDays
        .map((day, index) => ({index, currentIndex: currentIndex.get(day.id)}))
        .filter((item): item is {index: number; currentIndex: number} => item.currentIndex !== undefined);
    if (retained.length === 0) return true;
    const firstRequested = retained[0];
    const lastRequested = retained[retained.length - 1];
    // Existing days cannot be reordered or have a gap cut from their middle.
    if (!retained.every((item, index) => item.currentIndex === firstRequested.currentIndex + index)) return false;
    // Newly created days are permitted only on the boundaries of the period.
    return requestedDays.slice(firstRequested.index, lastRequested.index + 1)
        .every((day) => currentIndex.has(day.id));
}

function preserveSnapshots(currentDays: MenuDay[], requestedDays: MenuDay[]): MenuDay[] {
    const currentRecipes = new Map<string, MenuRecipe>();
    const currentMeals = new Set<string>();
    for (const day of currentDays) {
        for (const meal of day.meals) {
            currentMeals.add(meal.id);
            for (const recipe of meal.recipes) currentRecipes.set(recipe.id, recipe);
        }
    }

    return requestedDays.map((day) => {
        const currentDay = currentDays.find((item) => item.id === day.id);
        // New days are allowed at either end of the continuous period. Recipes are
        // still only added through the dedicated endpoint, so snapshots stay safe.
        if (!currentDay && day.meals.some((meal) => meal.recipes.length > 0)) {
            throw new Error("Добавляйте рецепт через специальное действие меню");
        }
        return {
            ...day,
            title: currentDay?.title ?? day.title,
            date: currentDay?.date ?? day.date,
            meals: day.meals.map((meal) => {
                if (!currentMeals.has(meal.id) && meal.recipes.length > 0) {
                    throw new Error("Добавляйте рецепт через специальное действие меню");
                }
                return {
                    ...meal,
                    recipes: meal.recipes.map((requestedRecipe) => {
                        const currentRecipe = currentRecipes.get(requestedRecipe.id);
                        if (!currentRecipe) throw new Error("Добавляйте рецепт через специальное действие меню");
                        return {
                            ...currentRecipe,
                            servings: requestedRecipe.servings,
                            includeInShopping: requestedRecipe.includeInShopping,
                        };
                    }),
                };
            }),
        };
    });
}

async function normalizeExtraProducts(days: MenuDay[]): Promise<MenuDay[]> {
    const products = days.flatMap((day) => day.meals.flatMap((meal) => meal.extraProducts));
    const commonIds = [...new Set(products
        .filter((product) => product.custom === false && product.commonIngredientId)
        .map((product) => product.commonIngredientId!))];
    const commonIngredients = commonIds.length > 0
        ? await CommonIngredient.findAll({where: {id: {[Op.in]: commonIds}}})
        : [];
    const commonById = new Map(commonIngredients.map((ingredient) => [ingredient.id, ingredient]));

    const normalize = (product: ExtraProduct): ExtraProduct => {
        const custom = product.custom ?? !product.commonIngredientId;
        if (custom) return {...product, commonIngredientId: null, custom: true};
        const commonIngredient = product.commonIngredientId
            ? commonById.get(product.commonIngredientId)
            : undefined;
        if (!commonIngredient) throw new Error("Выбранный дополнительный продукт не найден");
        return {
            ...product,
            name: commonIngredient.name,
            commonIngredientId: commonIngredient.id,
            custom: false,
        };
    };

    return days.map((day) => ({
        ...day,
        meals: day.meals.map((meal) => ({
            ...meal,
            extraProducts: meal.extraProducts.map(normalize),
        })),
    }));
}

export async function listMenus(req: AuthenticatedRequest, res: Response) {
    return res.json(await WeeklyMenu.findAll({
        where: {userId: req.user!.id},
        order: [["updatedAt", "DESC"]],
    }));
}

export async function createMenu(req: AuthenticatedRequest, res: Response) {
    const input = z.object({
        title: z.string().trim().min(1).max(255),
        description: z.string().trim().max(4000).optional().default(""),
    }).safeParse({title: req.body.title ?? "Меню недели", description: req.body.description});
    if (!input.success) return res.status(400).json({error: "Укажите название меню"});
    const menu = await WeeklyMenu.create({
        userId: req.user!.id,
        title: input.data.title,
        description: input.data.description,
        days: defaultDays(),
    });
    return res.status(201).json(menu);
}

export async function updateMenu(req: AuthenticatedRequest, res: Response) {
    const menu = await findMenu(req, res);
    if (!menu) return;
    const parsed = menuPatchSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({error: "Некорректные данные меню", details: parsed.error.flatten()});
    try {
        if (parsed.data.days) {
            if (!hasValidPeriodShape(menu.days, parsed.data.days)) {
                return res.status(400).json({error: "Дни можно добавлять или удалять только по краям периода"});
            }
            const preservedDays = preserveSnapshots(menu.days, parsed.data.days);
            if (!isContinuousDays(preservedDays)) {
                return res.status(400).json({error: "Дни меню должны идти подряд"});
            }
            menu.days = await normalizeExtraProducts(preservedDays);
        }
    } catch (error) {
        return res.status(400).json({error: error instanceof Error ? error.message : "Некорректное изменение меню"});
    }
    if (parsed.data.title) menu.title = parsed.data.title;
    if (parsed.data.description !== undefined) menu.description = parsed.data.description;
    await menu.save();
    return res.json(menu);
}

export async function deleteMenu(req: AuthenticatedRequest, res: Response) {
    const menu = await findMenu(req, res);
    if (!menu) return;
    await menu.destroy();
    return res.sendStatus(204);
}

export async function addRecipeToMeal(req: AuthenticatedRequest, res: Response) {
    const menu = await findMenu(req, res);
    if (!menu) return;
    const input = z.object({
        mealId: z.string().uuid(),
        recipeId: z.number().int().positive(),
        servings: z.number().int().min(1).max(100),
    }).safeParse(req.body);
    if (!input.success) return res.status(400).json({error: "Выберите рецепт, приём пищи и число порций"});
    const recipe = await findRecipeWithDetails(input.data.recipeId);
    if (!recipe) return res.status(404).json({error: "Рецепт не найден"});
    if (recipe.ownerId !== req.user?.id && !recipe.isPublished) return res.sendStatus(403);
    const recipeData = serializeRecipe(recipe);

    const snapshot: RecipeSnapshot = {
        originalRecipeId: recipe.id,
        title: recipeData.title,
        description: recipeData.description,
        category: recipeData.category,
        ingredients: recipeData.ingredients,
        preparing: recipeData.preparing,
        image: recipeData.image,
        servings: recipeData.servings,
        authorId: recipe.ownerId ?? null,
        capturedAt: new Date().toISOString(),
    };
    const days = structuredClone(menu.days);
    const meal = days.flatMap((day) => day.meals).find((item) => item.id === input.data.mealId);
    if (!meal) return res.status(404).json({error: "Приём пищи не найден"});
    meal.recipes.push({
        id: randomUUID(),
        recipeId: recipe.id,
        servings: input.data.servings,
        includeInShopping: true,
        recipeSnapshot: snapshot,
    });
    menu.days = days;
    await menu.save();
    return res.status(201).json(menu);
}

export async function updateMeal(req: AuthenticatedRequest, res: Response) {
    const menu = await findMenu(req, res);
    if (!menu) return;
    const input = z.object({
        recipes: z.array(z.object({
            id: z.string().uuid(),
            servings: z.number().int().min(1).max(100),
            includeInShopping: z.boolean(),
        })).optional(),
        extraProducts: z.array(extraProductSchema).optional(),
        includeInShopping: z.boolean().optional(),
    }).safeParse(req.body);
    if (!input.success) return res.status(400).json({error: "Некорректные данные приёма пищи"});
    const days = structuredClone(menu.days);
    const meal = days.flatMap((day) => day.meals).find((item: Meal) => item.id === req.params.mealId);
    if (!meal) return res.sendStatus(404);
    if (input.data.recipes) {
        const existing = new Map(meal.recipes.map((recipe) => [recipe.id, recipe]));
        meal.recipes = input.data.recipes.map((recipe) => {
            const current = existing.get(recipe.id);
            if (!current) throw new Error("Рецепт не принадлежит этому приёму пищи");
            return {...current, servings: recipe.servings, includeInShopping: recipe.includeInShopping};
        });
    }
    if (input.data.extraProducts) meal.extraProducts = input.data.extraProducts;
    if (typeof input.data.includeInShopping === "boolean") meal.includeInShopping = input.data.includeInShopping;
    try {
        menu.days = await normalizeExtraProducts(days);
    } catch (error) {
        return res.status(400).json({error: error instanceof Error ? error.message : "Некорректный дополнительный продукт"});
    }
    await menu.save();
    return res.json(menu);
}

export async function calculateShoppingList(req: AuthenticatedRequest, res: Response) {
    const menu = await findMenu(req, res);
    if (!menu) return;
    const items = calculateShoppingItems(menu.days);
    const [list] = await ShoppingList.findOrCreate({
        where: {menuId: menu.id},
        defaults: {menuId: menu.id, userId: req.user!.id, items, manualDirty: false},
    });
    list.items = items;
    list.userId = req.user!.id;
    list.manualDirty = false;
    await list.save();
    return res.json(list);
}

export async function getShoppingList(req: AuthenticatedRequest, res: Response) {
    const menu = await findMenu(req, res);
    if (!menu) return;
    const list = await ShoppingList.findOne({where: {menuId: menu.id, userId: req.user!.id}});
    return res.json(list ?? {menuId: menu.id, items: [], manualDirty: false});
}

export async function updateShoppingList(req: AuthenticatedRequest, res: Response) {
    const menu = await findMenu(req, res);
    if (!menu) return;
    const items = z.array(shoppingListItemSchema).safeParse(req.body.items);
    if (!items.success) return res.status(400).json({error: "Некорректные позиции списка покупок"});
    const [list] = await ShoppingList.findOrCreate({
        where: {menuId: menu.id},
        defaults: {menuId: menu.id, userId: req.user!.id, items: []},
    });
    list.items = items.data;
    list.userId = req.user!.id;
    list.manualDirty = true;
    await list.save();
    return res.json(list);
}
