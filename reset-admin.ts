import 'dotenv/config';
import { db } from "./lib/db";
import { users } from "./lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

async function reset() {
  console.log(" Step 1: Removing the old admin record...");
  await db.delete(users).where(eq(users.email, "admin@kcca.go.ug"));

  console.log(" Step 2: Creating the fresh admin with 'admin123'...");
  const hashedPassword = await bcrypt.hash("admin123", 10);
  
  await db.insert(users).values({
    fullName: "System Admin",
    email: "admin@kcca.go.ug",
    role: "admin",
    passwordHash: hashedPassword,
    isActive: true,
  });

  console.log("DONE! You can now log in at http://localhost:3000");
  process.exit(0);
}

reset().catch((err) => {
  console.error(" Reset failed:", err);
  process.exit(1);
});