import express, {Application} from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import menuRoutes from "./routes/menus";
import recipeRoutes from "./routes/recipes";
import ingredientRoutes from "./routes/ingredients";
import {uploadDirectory} from "./middleware/upload";
import "./models";

const app: Application = express();

app.use(cors());
app.use(express.json({limit: "10mb"}));
app.use("/uploads", express.static(uploadDirectory, {fallthrough: false}));
app.use("/auth", authRoutes);
app.use("/ingredients", ingredientRoutes);
app.use("/recipes", recipeRoutes);
app.use("/menus", menuRoutes);
app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(error);
    res.status(500).json({error: "Внутренняя ошибка сервера"});
});

export default app;
