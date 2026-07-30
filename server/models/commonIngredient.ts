import {CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model} from "sequelize";
import sequelize from "../db/sequelize";

export class CommonIngredientModel extends Model<
    InferAttributes<CommonIngredientModel>,
    InferCreationAttributes<CommonIngredientModel>
> {
    declare id: CreationOptional<number>;
    declare name: string;
    declare normalizedName: string;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

CommonIngredientModel.init({
    id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
    name: {type: DataTypes.STRING, allowNull: false},
    normalizedName: {type: DataTypes.STRING, allowNull: false, unique: true},
    createdAt: {type: DataTypes.DATE, allowNull: false},
    updatedAt: {type: DataTypes.DATE, allowNull: false},
}, {
    sequelize,
    modelName: "CommonIngredient",
    tableName: "common_ingredients",
    timestamps: true,
});

export default CommonIngredientModel;
