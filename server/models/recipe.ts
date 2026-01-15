import {DataTypes, Model, CreationOptional, InferAttributes, InferCreationAttributes} from "sequelize";
import sequelize from "../db/sequelize";
import type { Ingredient } from './../../src/types/index';

export class RecipeModel extends Model<
    InferAttributes<RecipeModel>,
    InferCreationAttributes<RecipeModel>
> {
    declare id: CreationOptional<number>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    declare title: string;
    declare ingredients: Ingredient[];
    declare preparing: string;
    declare image: CreationOptional<string>;
    declare servings: CreationOptional<number>;
}

RecipeModel.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
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
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
        }
    },
    {
        sequelize,
        modelName: "Recipe",
        tableName: "recipes",
        timestamps: true,
    });

export default RecipeModel;
