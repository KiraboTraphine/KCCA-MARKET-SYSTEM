import 'dotenv/config'; 
import { db } from "./lib/db"; 
import { users } from "./lib/db/schema";
import bcrypt from "bcrypt";

async function seed() {
  console.log("🌱 Seeding Master Admin...");

  const password = "admin123";
  const hashedPassword = await bcrypt.hash(password, 10);

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined in your .env file");
  }

  // Updated to use 'email' instead of 'staffNumber'
  await db.insert(users).values({
    fullName: "System Admin",
    email: "admin@kcca.go.ug", 
    role: "admin",
    passwordHash: hashedPassword,
    isActive: true,
  });

  console.log("Admin created successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});