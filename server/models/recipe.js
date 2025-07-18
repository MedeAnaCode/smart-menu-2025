const {DataTypes}= require("sequelize");
const sequelize = require("../db/sequelize");

const Recipe = sequelize.define('Recipe', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    ingredients: {
        type: DataTypes.ARRAY(DataTypes.JSON),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    image: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '/img/recipes/unknown.jpg'
    },
    servings: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            min: 1,
        }
    }
});

module.exports = Recipe;
