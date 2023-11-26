import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { DATABASE_URL } from "../env";

const sql = postgres(DATABASE_URL, { max: 1 })
export const db = drizzle(sql);