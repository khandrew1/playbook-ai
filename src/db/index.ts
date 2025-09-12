import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

// Ensure DATABASE_URL is provided in your environment (.env)
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	throw new Error("DATABASE_URL is not set in the environment");
}

const sql = neon(connectionString);

export const db = drizzle(sql);
