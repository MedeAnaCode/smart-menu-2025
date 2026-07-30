import {CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model} from "sequelize";
import sequelize from "../db/sequelize";
import type {MenuDay} from "../../src/types";

export class WeeklyMenuModel extends Model<InferAttributes<WeeklyMenuModel>, InferCreationAttributes<WeeklyMenuModel>> {
    declare id: CreationOptional<number>;
    declare userId: number;
    declare title: string;
    declare days: CreationOptional<MenuDay[]>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

WeeklyMenuModel.init({
    id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
    userId: {type: DataTypes.INTEGER, allowNull: false},
    title: {type: DataTypes.STRING, allowNull: false, defaultValue: "Меню недели"},
    days: {type: DataTypes.JSONB, allowNull: false, defaultValue: []},
    createdAt: {type: DataTypes.DATE, allowNull: false},
    updatedAt: {type: DataTypes.DATE, allowNull: false},
}, {
    sequelize,
    modelName: "WeeklyMenu",
    tableName: "weekly_menus",
    timestamps: true,
});

export default WeeklyMenuModel;
