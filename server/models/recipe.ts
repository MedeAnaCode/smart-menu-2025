import {DataTypes, Model} from "sequelize";
import sequelize from "../db/sequelize";
import type { RecipeAttributes, RecipeCreationAttributes } from './../../src/types/index';

const Recipe = sequelize.define<Model<RecipeAttributes, RecipeCreationAttributes>>('Recipe', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    ingredients: {
        type: DataTypes.ARRAY(DataTypes.JSON),
        allowNull: false
    },
    preparing: {
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

export default Recipe;
