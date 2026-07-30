import {defineConfig} from "vitest/config";

export default defineConfig({
    test: {
        include: ["server/**/*.test.ts"],
        environment: "node",
        coverage: {
            include: ["server/services/**/*.ts"],
        },
    },
});
