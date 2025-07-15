const express = require("express");
const { getAllRecipes } = require("../controllers/recipesController");

const router = express.Router(); //создаётся миниприложение router, куда мы добавляем маршруты (роуты)

router.get("/", getAllRecipes); // создаём маршрут GET внутри этого роута
// полный путь будет "/recipes" - это "/", но маршрутизатор подключён внутри app.use("/recipes", ...)

module.exports = router;
