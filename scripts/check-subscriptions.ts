import "dotenv/config";
import postgres from "postgres";

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { prepare: false, max: 1 });

  const rows = await sql`SELECT id, user_id, stripe_customer_id, status, price_id, current_period_start, current_period_end FROM subscriptions ORDER BY created DESC`;

  console.table(rows);

  await sql.end();
}

main();
