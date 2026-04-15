import { defineConfig } from "drizzle-kit";
import { env } from "process";

export default defineConfig({
    schema: "./src/server/database/tables/index.ts",
    dialect: "postgresql",
    dbCredentials: { url: env.DATABASE_URL! },
    verbose: true,
    strict: true,
});
