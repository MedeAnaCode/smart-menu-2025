import {Sequelize} from "sequelize";

const sequelize = new Sequelize("postgres", "Nastya", "run", {
    dialect: "postgres",
    host: "db",
    port: 5432,
    schema: "public",
});

export default sequelize;
