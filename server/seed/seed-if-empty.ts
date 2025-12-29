import Recipe from "../models/recipe";
import sequelize from "../db/sequelize";
import seedRecipes from "./create-recipes";

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
        } catch (e: unknown) {
            console.log('Ошибка при заполнении базы', e);
        } finally {
            await sequelize.close();
        }
})();
