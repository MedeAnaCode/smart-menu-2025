import Keycloak from "keycloak-js";

const keycloakUrl = `${window.location.protocol}//${window.location.hostname}:8080`;

export const keycloak = new Keycloak({
    url: keycloakUrl,
    realm: "smartmenu",
    clientId: "smartmenu-web",
});

let initialization: Promise<boolean> | null = null;

export const initializeKeycloak = (): Promise<boolean> => {
    if (!initialization) {
        initialization = keycloak.init({
            onLoad: "check-sso",
            pkceMethod: "S256",
            silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
            checkLoginIframe: false,
        });
    }
    return initialization;
};

export async function getAccessToken() {
    if (!keycloak.authenticated) return null;
    await keycloak.updateToken(30);
    return keycloak.token ?? null;
}
