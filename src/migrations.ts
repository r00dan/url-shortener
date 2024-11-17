import { sql } from "./database";

async function createUrlsTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS urls (
        id VARCHAR(10) PRIMARY KEY,
        original_url TEXT NOT NULL
      );
    `;
  } catch (error) {
    throw new Error(`Error while running migration: \n ${error}`);
  }
}

export async function runMigrations() {
  await createUrlsTable();
}
