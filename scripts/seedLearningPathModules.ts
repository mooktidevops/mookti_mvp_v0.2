import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { learningPathModules } from "../db/schema";

config({
    path: ".env.local",
});

const seedLearningPathModules = async () => {
    if (!process.env.POSTGRES_URL) {
        throw new Error("POSTGRES_URL is not defined");
    }

    const connection = postgres(process.env.POSTGRES_URL);
    const db = drizzle(connection);

    try {
        const result = await db.insert(learningPathModules).values({
            learningPathId: "87be8cbe-04be-4737-a4ad-7765dd9556b4",
            moduleId: "e4c86fd7-ab44-4465-af3b-85230a69ca66",
        }).returning();

        console.log("Module seeded:", result);
    } catch (error) {
        console.error("Error seeding module:", error);
    } finally {
        await connection.end();
    }
};

seedLearningPathModules();
