import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

export default [
    {
        //Планирую перевести проект полностью на TS, поэтому игнорирую js-файлы
        ignores: ["**/*.js", "**/*.jsx", "node_modules", "dist", "build"],
    },
    {
        files: ["**/*.ts", "**/*.tsx"],

        languageOptions: {
            parser: tsParser,
            parserOptions: {
                project: "./tsconfig.json",
                sourceType: "module",
                ecmaVersion: "latest"
            }
        },

        plugins: {
            "@typescript-eslint": tsPlugin
        },

        rules: {
            // ===== УМЕРЕННЫЙ НАБОР =====

            // Не заставляем указывать типы везде
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "@typescript-eslint/no-inferrable-types": "off",

            // Реальные ошибки
            "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
            "@typescript-eslint/no-floating-promises": "warn",
            "@typescript-eslint/no-misused-promises": "warn",

            // Разрешаем any, но предупреждаем
            "@typescript-eslint/no-explicit-any": "warn",

            // Позволяем пустые функции
            "@typescript-eslint/no-empty-function": "off",

            // Полезное правило
            "no-duplicate-imports": "warn"
        }
    }
];
