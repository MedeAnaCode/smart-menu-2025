const Recipe = require("../models/recipe");
const sequelize = require("../db/sequelize");
const seedRecipes = require("./create-recipes.js");

(async () => {
        try {
            await sequelize.authenticate();
            await Recipe.sync();
            const count = await Recipe.count();
            if (count > 0 ) {
                console.log('БД уже заполнена');
            } else {
                await seedRecipes();
                console.log('Рецепты добавлены');
            }
        } catch (e) {
            console.log('Ошибка при заполнении базы', e);
        } finally {
            await sequelize.close();
        }
})();
