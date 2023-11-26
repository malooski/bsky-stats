import dotenv from 'dotenv';
dotenv.config()

import type { Config } from "drizzle-kit";
 
export default {
  schema: "./src/common/db/schema.ts",
  out: "./drizzle",
} satisfies Config;