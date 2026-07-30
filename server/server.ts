import app from "./app";
import sequelize from "./db/sequelize";
import {runMigrations} from "./db/migrate";
import "./models";

const PORT: number = Number(process.env.PORT ?? 3001);

sequelize.sync().then(runMigrations).then(() => {
    app.listen(PORT, () => {
        console.log(`Сервер слушает порт ${PORT}`);
    });
}).catch((error: unknown) => {
    console.error("Ошибка запуска сервера", error);
});
