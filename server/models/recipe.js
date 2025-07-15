const {DataTypes}= require("sequelize");
const sequelize = require("../db/sequelize");

const Recipe = sequelize.define('Recipe', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    ingredients: {
        type: DataTypes.JSON,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    image: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = Recipe;
