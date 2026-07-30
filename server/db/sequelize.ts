import {Sequelize} from "sequelize";

const sequelize = new Sequelize(
    process.env.POSTGRES_DB ?? "postgres",
    process.env.POSTGRES_USER ?? "Nastya",
    process.env.POSTGRES_PASSWORD ?? "run",
    {
    dialect: "postgres",
    host: process.env.POSTGRES_HOST ?? "db",
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    schema: "public",
});

export default sequelize;
