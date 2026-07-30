import {CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, NonAttribute} from "sequelize";
import sequelize from "../db/sequelize";
import type {CommonIngredientModel} from "./commonIngredient";

export class RecipeIngredientModel extends Model<
    InferAttributes<RecipeIngredientModel>,
    InferCreationAttributes<RecipeIngredientModel>
> {
    declare id: CreationOptional<number>;
    declare recipeId: number;
    declare commonIngredientId: CreationOptional<number | null>;
    declare customName: CreationOptional<string | null>;
    declare amount: string;
    declare unit: string;
    declare position: number;
    declare commonIngredient?: NonAttribute<CommonIngredientModel>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

RecipeIngredientModel.init({
    id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
    recipeId: {type: DataTypes.INTEGER, allowNull: false},
    commonIngredientId: {type: DataTypes.INTEGER, allowNull: true},
    customName: {type: DataTypes.STRING, allowNull: true},
    amount: {type: DataTypes.STRING, allowNull: false},
    unit: {type: DataTypes.STRING, allowNull: false},
    position: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
    createdAt: {type: DataTypes.DATE, allowNull: false},
    updatedAt: {type: DataTypes.DATE, allowNull: false},
}, {
    sequelize,
    modelName: "RecipeIngredient",
    tableName: "recipe_ingredients",
    timestamps: true,
    validate: {
        exactlyOneIngredientSource() {
            const hasCommon = this.commonIngredientId !== null && this.commonIngredientId !== undefined;
            const hasCustom = typeof this.customName === "string" && Boolean(this.customName.trim());
            if (hasCommon === hasCustom) {
                throw new Error("Ingredient position must have exactly one source");
            }
        },
    },
});

export default RecipeIngredientModel;
