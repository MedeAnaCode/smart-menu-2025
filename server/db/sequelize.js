const {Sequelize}= require("sequelize");

const sequelize = new Sequelize("postgres", "Nastya", "run", {
    dialect: "postgres",
    host: "127.0.0.1",
    port: "5432",
    schema: "public",
});

module.exports = sequelize;
