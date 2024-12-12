import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { learningPaths } from "../db/schema";

config({
  path: ".env.local",
});

const seedLearningPaths = async () => {
  if (!process.env.POSTGRES_URL) {
    throw new Error("POSTGRES_URL is not defined");
  }

  const connection = postgres(process.env.POSTGRES_URL);
  const db = drizzle(connection);

  try {
    const result = await db.insert(learningPaths).values({
      title: "Workplace Success",
      description: "Learning path to help you succeed in your new work environment, with an emphasis on strong communication alongside cultural and emotional intelligence.",
      slug: 'workplace-success',
    }).returning();

    console.log("Learning Path seeded:", result);
  } catch (error) {
    console.error("Error seeding learning path:", error);
  } finally {
    await connection.end();
  }
};

seedLearningPaths();