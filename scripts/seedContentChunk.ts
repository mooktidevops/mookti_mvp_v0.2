import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { contentChunk } from "../db/schema";

config({
  path: ".env.local",
});

const seedContentChunk = async () => {
  if (!process.env.POSTGRES_URL) {
    throw new Error("POSTGRES_URL is not defined");
  }

  const connection = postgres(process.env.POSTGRES_URL);
  const db = drizzle(connection);

  try {
    const result = await db.insert(contentChunk).values({
      moduleId: 1,
      chunkId: 2,
      title: "Welcome to Collaborative Work Environments 2",
      description: "Module Description",
      type: "introduction",
      nextAction: "checkIn",
      content: "Over the course of this module, you will learn evidence-based strategies for working in close-knit teams. Many new graduates report lacking this skillset when they start working, so by completing this module, you'll be set up for success in your new career!",
    }).returning();

    console.log("Seeded ContentChunk:", result);
  } catch (error) {
    console.error("Error seeding ContentChunk:", error);
  } finally {
    await connection.end();
  }
};

seedContentChunk();