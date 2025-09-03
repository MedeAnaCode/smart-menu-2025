const express = require("express");
const { getAllRecipes, createRecipe, deleteRecipe } = require("../controllers/recipesController");

const router = express.Router(); //создаётся миниприложение router, куда мы добавляем маршруты (роуты)

//Логика загрузки списка рецептов из БД:
router.get("/", getAllRecipes); // создаём маршрут GET внутри этого роута
// полный путь будет "/recipes" - это "/", но маршрутизатор подключён внутри app.use("/recipes", ...)

//Логика получения данных для создания нового рецепта:
router.post('/', createRecipe);

//Логика удаления рецепта
router.delete('/:id', deleteRecipe);

module.exports = router;
