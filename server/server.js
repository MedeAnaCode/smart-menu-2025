const app = require("./app");
const seedRecipes = require("./seed/create-recipes");

const PORT = 3001;

(async () => {
    try {
        await seedRecipes();
        app.listen(PORT, () => {
            console.log("Сервер слушает порт 3001");
        });
    } catch (e) {
        console.error("Ошибка при запуске сервера:", e);
    }
})();

