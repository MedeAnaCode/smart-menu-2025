const realm = process.env.KEYCLOAK_REALM ?? "smartmenu";
const publicUrl = process.env.KEYCLOAK_PUBLIC_URL ?? "http://localhost:8080";
const internalUrl = process.env.KEYCLOAK_INTERNAL_URL ?? publicUrl;

export const keycloakConfig = {
    clientId: process.env.KEYCLOAK_CLIENT_ID ?? "smartmenu-web",
    issuer: `${publicUrl}/realms/${realm}`,
    jwksUrl: `${internalUrl}/realms/${realm}/protocol/openid-connect/certs`,
};
