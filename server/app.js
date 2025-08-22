const express = require("express");
const cors = require("cors");
const recipeRoutes = require("./routes/recipes");
const app = express();

app.use(cors()); //добавляет в заголовки ответа сервара разрешения на кроссдоменные запросы
app.use(express.json());// для чтения JSON из тела запроса
app.use("/recipes", recipeRoutes); // <-- на входе есть путь и колбэк, который выполняется, если путь совпадает
//в данном случае в колбэке маршрутизатор (выполняй эти маршруты, если адрес /recipes)

module.exports = app;
