import {readFileSync} from "node:fs";
import {afterAll, describe, expect, it} from "vitest";
import {QueryTypes, Sequelize, type Transaction} from "sequelize";

// Opt-in PostgreSQL checks. Use a disposable DB, never the application's database.
const databaseUrl = process.env.CANONICAL_TEST_DATABASE_URL;
const migration = readFileSync(new URL("../../docs/migrations/2026-09-22-canonical-ingredient-names.sql", import.meta.url), "utf8");

describe.skipIf(!databaseUrl)("canonical ingredient migration (PostgreSQL)", () => {
    const database = databaseUrl ? new Sequelize(databaseUrl, {logging: false}) : undefined;
    afterAll(async () => { await database?.close(); });

    async function withCatalog(check: (transaction: Transaction) => Promise<void>) {
        const transaction = await database!.transaction();
        try {
            // Temporary tables shadow persistent names on this connection.
            await database!.query(`
                CREATE TEMP TABLE common_ingredients (
                    id INTEGER PRIMARY KEY, name TEXT NOT NULL,
                    "normalizedName" TEXT NOT NULL UNIQUE,
                    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
                ) ON COMMIT DROP;
                CREATE TEMP TABLE recipe_ingredients (
                    id INTEGER PRIMARY KEY,
                    "commonIngredientId" INTEGER REFERENCES common_ingredients(id)
                ) ON COMMIT DROP;
            `, {transaction});
            await check(transaction);
        } finally {
            await transaction.rollback();
        }
    }

    async function insertCatalog(names: string[], transaction: Transaction) {
        for (const [index, name] of names.entries()) {
            await database!.query('INSERT INTO common_ingredients (id, name, "normalizedName") VALUES (:id, :name, LOWER(:name))', {
                replacements: {id: index + 1, name}, transaction,
            });
        }
    }

    it("renames the catalog in place without changing IDs, references or natural plurals", async () => {
        await withCatalog(async (transaction) => {
            await insertCatalog(["Яйца", "Огурцы", "Помидоры", "Томаты", "Грибы", "Креветки", "Маслины", "Листья лайма", "Мед", "Спагетти", "Макароны", "Овсяные хлопья долгой варки", "Чеснок", "Розмарин сушёный"], transaction);
            await database!.query('INSERT INTO recipe_ingredients VALUES (1, 1)', {transaction});
            await database!.query(migration, {transaction});
            const rows = await database!.query<{id: number; name: string; normalizedName: string}>('SELECT * FROM common_ingredients ORDER BY id', {transaction, type: QueryTypes.SELECT});
            expect(rows.map(row => row.name)).toEqual(["Яйцо", "Огурец", "Помидор", "Томат", "Гриб", "Креветка", "Маслина", "Лист лайма", "Мёд", "Спагетти", "Макароны", "Овсяные хлопья долгой варки", "Чеснок", "Сушёный розмарин"]);
            expect(rows.map(row => row.id)).toEqual(Array.from({length: 14}, (_, index) => index + 1));
            for (const row of rows) expect(row.normalizedName).toBe(row.name.toLocaleLowerCase("ru-RU"));
            const joined = await database!.query<{name: string}>('SELECT c.name FROM recipe_ingredients r JOIN common_ingredients c ON c.id = r."commonIngredientId"', {transaction, type: QueryTypes.SELECT});
            expect(joined).toEqual([{name: "Яйцо"}]);
        });
    });

    it("accepts an empty catalog and an already canonical catalog", async () => {
        await withCatalog(async (transaction) => {
            await database!.query(migration, {transaction});
            // Simulate the ON COMMIT DROP between successive migration transactions.
            await database!.query('DROP TABLE canonical_ingredient_renames', {transaction});
            await insertCatalog(["Яйцо", "Помидор", "Спагетти"], transaction);
            await database!.query(migration, {transaction});
            const rows = await database!.query<{name: string}>('SELECT name FROM common_ingredients ORDER BY id', {transaction, type: QueryTypes.SELECT});
            expect(rows.map(row => row.name)).toEqual(["Яйцо", "Помидор", "Спагетти"]);
        });
    });

    it("stops on collisions without merging IDs or partially renaming other entries", async () => {
        await withCatalog(async (transaction) => {
            await insertCatalog(["Огурцы", "Яйца", "Яйцо"], transaction);
            await database!.query('SAVEPOINT before_rename', {transaction});
            await expect(database!.query(migration, {transaction})).rejects.toThrow("Canonical ingredient names conflict");
            await database!.query('ROLLBACK TO SAVEPOINT before_rename', {transaction});
            const rows = await database!.query<{id: number; name: string}>('SELECT id, name FROM common_ingredients ORDER BY id', {transaction, type: QueryTypes.SELECT});
            expect(rows).toEqual([{id: 1, name: "Огурцы"}, {id: 2, name: "Яйца"}, {id: 3, name: "Яйцо"}]);
        });
    });
});
