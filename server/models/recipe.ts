import {DataTypes, Model, CreationOptional, InferAttributes, InferCreationAttributes, NonAttribute} from "sequelize";
import sequelize from "../db/sequelize";
import type { Ingredient } from './../../src/types/index';
import type {RecipeIngredientModel} from "./recipeIngredient";
import type {UserModel} from "./user";

export class RecipeModel extends Model<
    InferAttributes<RecipeModel>,
    InferCreationAttributes<RecipeModel>
> {
    declare id: CreationOptional<number>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    declare title: string;
    declare description: CreationOptional<string>;
    declare category: CreationOptional<string>;
    declare ingredients: Ingredient[];
    declare preparing: string;
    declare image: CreationOptional<string>;
    declare servings: CreationOptional<number>;
    declare ownerId: CreationOptional<number | null>;
    declare isPublished: CreationOptional<boolean>;
    declare publishedAt: CreationOptional<Date | null>;
    declare ingredientPositions?: NonAttribute<RecipeIngredientModel[]>;
    declare owner?: NonAttribute<UserModel>;
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
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
            defaultValue: '',
        },
        category: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'other',
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
        ownerId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        isPublished: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        publishedAt: {
            type: DataTypes.DATE,
            allowNull: true,
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
