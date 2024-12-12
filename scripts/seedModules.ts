import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { modules } from "../db/schema";

config({
  path: ".env.local",
});

const seedModule = async () => {
  if (!process.env.POSTGRES_URL) {
    throw new Error("POSTGRES_URL is not defined");
  }

  const connection = postgres(process.env.POSTGRES_URL);
  const db = drizzle(connection);

  try {
    const result = await db.insert(modules).values({
      title: "Getting Started with the Workplace Success Learning Path",
      description: "Itrroduction to the Workplace Success Learning Path",
      slug: 'intro-to-workplace-success',
    }).returning();

    console.log("Module seeded:", result);
  } catch (error) {
    console.error("Error seeding module:", error);
  } finally {
    await connection.end();
  }
};

seedModule();

