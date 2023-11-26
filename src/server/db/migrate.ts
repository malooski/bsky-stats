import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "./connection";

 
export async function migrateDatabase() {
    await migrate(db, { migrationsFolder: "drizzle" });
}
