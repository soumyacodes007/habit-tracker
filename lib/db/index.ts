import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Neon serverless HTTP driver — works in edge runtime & Node.js
const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql, { schema });

// Re-export schema for convenience in repositories
export * from "./schema";
