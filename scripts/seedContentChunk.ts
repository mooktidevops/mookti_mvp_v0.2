import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { contentChunks } from "../db/schema";

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
    const result = await db.insert(contentChunks).values({
      moduleId: '00000000-0000-0000-0000-000000000000', // Replace with a valid module ID
      order: 1,
      title: "Welcome to Collaborative Work Environments",
      description: "Introduction to working in teams",
      type: "introduction",
      nextAction: "getNext",
      content: "In this module, you will learn evidence-based strategies for working in close-knit teams. Many new graduates report lacking this skillset when they start working, so by completing this module, you'll be set up for success in your new career!",
    }).returning();

    console.log("Content chunk seeded:", result);
  } catch (error) {
    console.error("Error seeding content chunk:", error);
  } finally {
    await connection.end();
  }
};

seedContentChunk();