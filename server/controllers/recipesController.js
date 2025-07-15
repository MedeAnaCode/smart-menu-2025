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

module.exports = {
    getAllRecipes
};
