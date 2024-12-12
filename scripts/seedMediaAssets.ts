import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { mediaAssets } from "../db/schema";

config({
  path: ".env.local",
});

const seedMediaAssets = async () => {
  if (!process.env.POSTGRES_URL) {
    throw new Error("POSTGRES_URL is not defined");
  }

  const connection = postgres(process.env.POSTGRES_URL);
  const db = drizzle(connection);

  try {
    const result = await db.insert(mediaAssets).values({
      url: "https://example",
      type: "image",
      altText: 'alt text example',
    }).returning();

    console.log("Module seeded:", result);
  } catch (error) {
    console.error("Error seeding module:", error);
  } finally {
    await connection.end();
  }
};

seedMediaAssets();

