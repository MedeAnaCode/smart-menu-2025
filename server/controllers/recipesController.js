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

//здесь я напишу функцию deleteRecipe, которая будет удалять рецепт из БД

module.exports = {
    getAllRecipes,
    createRecipe
};
