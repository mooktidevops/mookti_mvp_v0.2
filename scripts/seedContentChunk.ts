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
      chunkId: 1,
      title: "Welcome to Collaborative Work Environments",
      description: "An introduction to working effectively in corporate teams.",
      type: "introduction",
      nextAction: "getnext",
      content: "Welcome to our course on Collaborative Work Environments! In this module, we'll explore key strategies for success in corporate teams. Whether you're a recent graduate or transitioning into a new role, these skills will be invaluable in your career. Let's begin by understanding the importance of effective communication in diverse teams.",
    }).returning();

    console.log("Seeded ContentChunk:", result);
  } catch (error) {
    console.error("Error seeding ContentChunk:", error);
  } finally {
    await connection.end();
  }
};

seedContentChunk();