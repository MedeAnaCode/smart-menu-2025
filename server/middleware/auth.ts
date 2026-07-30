import type {NextFunction, Request, Response} from "express";
import {createRemoteJWKSet, jwtVerify} from "jose";
import {keycloakConfig} from "../config/keycloak";
import {User} from "../models";

export type AuthenticatedRequest = Request & {
    user?: {
        id: number;
        keycloakId: string;
        email: string;
        name: string;
    };
};

const jwks = createRemoteJWKSet(new URL(keycloakConfig.jwksUrl));

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const token = req.header("authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) return res.status(401).json({error: "Требуется авторизация"});

    try {
        const {payload} = await jwtVerify(token, jwks, {issuer: keycloakConfig.issuer});
        const keycloakId = payload.sub;
        const email = typeof payload.email === "string" ? payload.email.toLowerCase() : "";
        const name = typeof payload.name === "string"
            ? payload.name
            : typeof payload.preferred_username === "string" ? payload.preferred_username : email;
        const authorizedParty = typeof payload.azp === "string"
            ? payload.azp
            : typeof payload.client_id === "string" ? payload.client_id : "";
        const audience = Array.isArray(payload.aud) ? payload.aud : payload.aud ? [payload.aud] : [];

        if (!keycloakId || !email) {
            return res.status(401).json({error: "Токен не содержит идентификатор пользователя"});
        }
        if (authorizedParty !== keycloakConfig.clientId && !audience.includes(keycloakConfig.clientId)) {
            return res.status(401).json({error: "Токен выпущен для другого клиента"});
        }

        let user = await User.findOne({where: {keycloakId}});
        if (!user) {
            const legacy = await User.findOne({where: {email}});
            if (legacy) {
                legacy.keycloakId = keycloakId;
                legacy.name = name;
                await legacy.save();
                user = legacy;
            } else {
                user = await User.create({keycloakId, email, name});
            }
        } else if (user.email !== email || user.name !== name) {
            await user.update({email, name});
        }

        req.user = {id: user.id, keycloakId, email, name};
        next();
    } catch {
        return res.status(401).json({error: "Сессия недействительна"});
    }
}
