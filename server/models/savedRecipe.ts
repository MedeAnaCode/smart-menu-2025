import {CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, NonAttribute} from "sequelize";
import sequelize from "../db/sequelize";
import type {RecipeModel} from "./recipe";

export class SavedRecipeModel extends Model<InferAttributes<SavedRecipeModel>, InferCreationAttributes<SavedRecipeModel>> {
    declare id: CreationOptional<number>;
    declare userId: number;
    declare recipeId: number;
    declare recipe?: NonAttribute<RecipeModel>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

SavedRecipeModel.init({
    id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
    userId: {type: DataTypes.INTEGER, allowNull: false},
    recipeId: {type: DataTypes.INTEGER, allowNull: false},
    createdAt: {type: DataTypes.DATE, allowNull: false},
    updatedAt: {type: DataTypes.DATE, allowNull: false},
}, {
    sequelize,
    modelName: "SavedRecipe",
    tableName: "saved_recipes",
    timestamps: true,
    indexes: [{unique: true, fields: ["userId", "recipeId"]}],
});

export default SavedRecipeModel;
