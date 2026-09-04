import {createContext, type ReactNode, useContext, useEffect, useMemo, useState} from "react";
import {initializeKeycloak, keycloak} from "./keycloak";

type AuthContextValue = {
    ready: boolean;
    authenticated: boolean;
    name: string;
    login: () => Promise<void>;
    register: () => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({children}: {children: ReactNode}) {
    const [ready, setReady] = useState(false);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        void initializeKeycloak().then((isAuthenticated) => {
            setAuthenticated(isAuthenticated);
            setReady(true);
        }).catch(() => {
            setReady(true);
        });
    }, []);

    const value = useMemo<AuthContextValue>(() => ({
        ready,
        authenticated,
        name: String(keycloak.tokenParsed?.name ?? keycloak.tokenParsed?.preferred_username ?? ""),
        login: async () => {
            await initializeKeycloak();
            await keycloak.login({redirectUri: window.location.href});
        },
        register: async () => {
            await initializeKeycloak();
            await keycloak.register({redirectUri: `${window.location.origin}/profile/recipes`});
        },
        logout: async () => {
            await initializeKeycloak();
            await keycloak.logout({redirectUri: `${window.location.origin}/profile/recipes`});
        },
    }), [authenticated, ready]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used inside AuthProvider");
    return context;
}
