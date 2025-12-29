import sequelize from "../db/sequelize";
import seedRecipes from "./create-recipes";

(async () => {
    try {
        await sequelize.authenticate();
        await seedRecipes();
        console.log('Рецепты добавлены');
    } catch (e: unknown) {
        console.log('Ошибка при заполнении базы', e);
    } finally {
        await sequelize.close();
    }
})();
