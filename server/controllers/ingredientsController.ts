import {Op} from "sequelize";
import type {Request, Response} from "express";
import {CommonIngredient} from "../models";

export async function listIngredients(req: Request, res: Response) {
    const query = String(req.query.q ?? "").trim();
    const ingredients = await CommonIngredient.findAll({
        where: query ? {name: {[Op.iLike]: `%${query}%`}} : undefined,
        attributes: ["id", "name"],
        order: [["name", "ASC"]],
        limit: 50,
    });
    return res.json(ingredients);
}
