import { config } from "dotenv";
import { eq, lt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { contentChunk } from "../db/schema";

config({
  path: ".env.local",
});

const deleteOldContentChunks = async () => {
  if (!process.env.POSTGRES_URL) {
    throw new Error("POSTGRES_URL is not defined");
  }

  const connection = postgres(process.env.POSTGRES_URL);
  const db = drizzle(connection);

  try {
    // Get the most recent content chunk
    const mostRecent = await db.select().from(contentChunk)
      .orderBy(contentChunk.createdAt, 'desc')
      .limit(1);

    if (mostRecent.length === 0) {
      console.log("No content chunks found.");
      return;
    }

    // Delete all chunks older than the most recent one
    const result = await db.delete(contentChunk)
      .where(lt(contentChunk.createdAt, mostRecent[0].createdAt));

    console.log(`Deleted ${result.rowCount} old content chunks.`);
  } catch (error) {
    console.error("Error deleting old Content Chunks:", error);
  } finally {
    await connection.end();
  }
};

deleteOldContentChunks();