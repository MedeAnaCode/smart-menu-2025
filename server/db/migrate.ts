import {readdir, readFile} from "node:fs/promises";
import path from "node:path";
import {QueryTypes} from "sequelize";
import sequelize from "./sequelize";

export async function runMigrations() {
    await sequelize.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
            name VARCHAR(255) PRIMARY KEY,
            "appliedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        )
    `);

    const directory = process.env.MIGRATIONS_DIR ?? path.resolve(process.cwd(), "docs", "migrations");
    const files = (await readdir(directory)).filter((file) => file.endsWith(".sql")).sort();
    const rows = await sequelize.query<{name: string}>("SELECT name FROM schema_migrations", {
        type: QueryTypes.SELECT,
    });
    const applied = new Set(rows.map((row) => row.name));

    for (const file of files) {
        if (applied.has(file)) continue;
        const sql = await readFile(path.join(directory, file), "utf8");
        await sequelize.transaction(async (transaction) => {
            await sequelize.query(sql, {transaction});
            await sequelize.query("INSERT INTO schema_migrations (name) VALUES (:name)", {
                replacements: {name: file},
                transaction,
            });
        });
    }
}
