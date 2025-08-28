const Recipe = require("../models/recipe");
const sequelize = require("../db/sequelize");
const seedRecipes = require("./create-recipes.js");

(async () => {
    try {
        await sequelize.authenticate();
        await seedRecipes();
        console.log('Рецепты добавлены');
    } catch (e) {
        console.log('Ошибка при заполнении базы', e);
    } finally {
        await sequelize.close();
    }
})();
