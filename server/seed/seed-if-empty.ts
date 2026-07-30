import {Recipe} from "../models";
import sequelize from "../db/sequelize";
import seedRecipes from "./create-recipes";

void (async () => {
        try {
            await sequelize.authenticate();
            await sequelize.sync();
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
