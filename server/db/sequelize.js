const {Sequelize}= require("sequelize");

const sequelize = new Sequelize("postgres", "Nastya", "run", {
    dialect: "postgres",
    host: "db",
    port: "5432",
    schema: "public",
});

module.exports = sequelize;
