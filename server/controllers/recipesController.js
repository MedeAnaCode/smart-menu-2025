const Recipe = require("../models/recipe");

const getAllRecipes = async (req, res) => { //контроллер, асинхронная функция, которая обрабатывает входящий http-запрос req, res - объект для ответа клиенту
    try {
        const recipes = await Recipe.findAll(); // обращаемся к БД за рецептами
        res.json(recipes); //добавляем в объект ответа json из массива с рецептами
    } catch (err) {
        console.error("Ошибка при получении рецептов:", err);
        res.status(500).json({ error: "Ошибка сервера" });
    }
};

const createRecipe = async (req, res) => {
    try {
        const { title, ingredients, description, image, servings } = req.body;
        const recipe = await Recipe.create({
            title,
            ingredients,
            description,
            image,
            servings
        });
        res.status(201).json(recipe); //201 - ресурс был успешно создан
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка при создании рецепта' });
    }
};

const deleteRecipe = async (req, res) => {
    const currentId = Number(req.params.id);

    if (isNaN(currentId) || !Number.isInteger(currentId) || currentId <= 0) {
        return res.status(400).json({ error: "Некорректный id" });
    }

    try {
        await Recipe.destroy({
            where: {
                id: currentId,
            },
        });

        res.sendStatus(204);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка сервера" });
    }
};

const updateRecipe = async (req, res) => {
    const ALLOWED = ['title','ingredients','description','image','servings'];

    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Некорректный id' });

    const updates = {};
    for (const k of ALLOWED) if (k in req.body) updates[k] = req.body[k];
    if ('servings' in updates) updates.servings = Number(updates.servings);
    if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'Пустое обновление' });

    try {
        const recipe = await Recipe.findByPk(id);
        if (!recipe) return res.status(404).json({ error: 'Не найдено' });

        await recipe.update(updates);
        return res.status(200).json(recipe);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Ошибка при обновлении рецепта' });
    }
};

module.exports = {
    getAllRecipes,
    createRecipe,
    deleteRecipe,
    updateRecipe
};
