import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./tables";
import { env } from "process";

const client = postgres(env.DATABASE_URL!, { prepare: false, max: 10 });

export default drizzle(client, { schema });
