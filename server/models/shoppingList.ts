import {CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model} from "sequelize";
import sequelize from "../db/sequelize";
import type {ShoppingListItem} from "../../src/types";

export class ShoppingListModel extends Model<InferAttributes<ShoppingListModel>, InferCreationAttributes<ShoppingListModel>> {
    declare id: CreationOptional<number>;
    declare userId: number;
    declare menuId: number;
    declare items: CreationOptional<ShoppingListItem[]>;
    declare manualDirty: CreationOptional<boolean>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

ShoppingListModel.init({
    id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
    userId: {type: DataTypes.INTEGER, allowNull: false},
    menuId: {type: DataTypes.INTEGER, allowNull: false, unique: true},
    items: {type: DataTypes.JSONB, allowNull: false, defaultValue: []},
    manualDirty: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false},
    createdAt: {type: DataTypes.DATE, allowNull: false},
    updatedAt: {type: DataTypes.DATE, allowNull: false},
}, {
    sequelize,
    modelName: "ShoppingList",
    tableName: "shopping_lists",
    timestamps: true,
});

export default ShoppingListModel;
