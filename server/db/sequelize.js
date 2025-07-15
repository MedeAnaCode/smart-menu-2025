const {Sequelize}= require("sequelize");

const sequelize = new Sequelize(
    process.env.POSTGRES_DB || "postgres",
    process.env.POSTGRES_USER || "Nastya",
    process.env.POSTGRES_PASSWORD || "run",
    {
        dialect: "postgres",
        host: process.env.POSTGRES_HOST || "127.0.0.1",
        port: process.env.POSTGRES_PORT || "5432",
        schema: "public",
    }
);

module.exports = sequelize;
