const seedRecipes = require("./seed/create-recipes");
const sequelize = require("./db/sequelize");

(async () => {
    try {
        await seedRecipes();
        await sequelize.close();
        console.log('Рецепты добавлены');
    } catch (e) {
        console.log('Ошибка при заполнении базы', e);
        await sequelize.close();
    }
})();
