const realm = process.env.KEYCLOAK_REALM ?? "smartmenu";
const publicUrl = process.env.KEYCLOAK_PUBLIC_URL ?? "http://localhost:8080";
const internalUrl = process.env.KEYCLOAK_INTERNAL_URL ?? publicUrl;
const additionalPublicUrls = (process.env.KEYCLOAK_ADDITIONAL_PUBLIC_URLS ?? "")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);

export const keycloakConfig = {
    clientId: process.env.KEYCLOAK_CLIENT_ID ?? "smartmenu-web",
    issuer: `${publicUrl}/realms/${realm}`,
    issuers: [publicUrl, ...additionalPublicUrls].map((url) => `${url}/realms/${realm}`),
    jwksUrl: `${internalUrl}/realms/${realm}/protocol/openid-connect/certs`,
};
