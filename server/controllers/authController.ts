import type {Response} from "express";
import type {AuthenticatedRequest} from "../middleware/auth";

export async function me(req: AuthenticatedRequest, res: Response) {
    return res.json({user: req.user});
}
