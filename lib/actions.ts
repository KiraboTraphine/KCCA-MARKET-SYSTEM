"use server"

import { db } from "./db/index" 
import { collections, users, productCategories, suppliers } from "./db/schema"
import { desc, eq, sql } from "drizzle-orm"
import bcrypt from "bcrypt"
import { revalidatePath } from "next/cache"

/**
 * 1. LOGIN ACTION
 */
export async function loginUser(email: string, password: string) {
  try {
    console.log(`Login attempt for: ${email}`);

    const [user] = await db.select()
      .from(users)
      .where(eq(users.email, email.trim().toLowerCase()))
      .limit(1);

    if (!user) {
      console.log("User not found in database");
      return { success: false, error: "User not found" };
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    
    if (!isMatch) {
      console.log("Password mismatch for user:", email);
      return { success: false, error: "Invalid password" };
    }

    console.log("Login successful for:", user.fullName);
    return { 
      success: true, 
      user: { id: user.id, role: user.role, name: user.fullName } 
    };
  } catch (error) {
    console.error("Login Error:", error);
    return { success: false, error: "Database connection failed" };
  }
}

/**
 * 2. CREATE USER ACTION
 * Optimized to catch the "Value too long" error (22001)
 */
export async function createUser(data: {
  fullName: string;
  email: string;
  role: "admin" | "collector";
  password: string;
}) {
  try {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newUser = await db.insert(users).values({
      fullName: data.fullName,
      email: data.email.toLowerCase().trim(),
      role: data.role,
      passwordHash: hashedPassword,
      isActive: true,
    }).returning();

    console.log(`👤 New ${data.role} created: ${data.fullName}`);
    
    // Purge layout cache to show the new collector immediately
    revalidatePath("/", "layout");

    return { success: true, user: newUser[0] };
  } catch (error: any) {
    console.error("User Creation Error:", error);

    if (error.code === '22001') {
       return { 
         success: false, 
         error: "Database capacity reached: Please run the SQL ALTER commands in Neon to expand column limits." 
       };
    }

    if (error.code === '23505') {
      return { success: false, error: "An account with this email already exists." };
    }
    
    return { success: false, error: "Failed to create user account. Technical details: " + error.message };
  }
}

/**
 * 3. DASHBOARD STATISTICS
 * MIXED STATE RULE: Aggregates real-time database facts alongside local mock collections.
 */
export async function getDashboardStats(localTransactions: any[] = []) {
  try {
    const totalRevenue = await db.select({ 
      sum: sql<number>`sum(${collections.totalAmount})` 
    }).from(collections);

    const totalCollections = await db.select({ 
      count: sql<number>`count(*)` 
    }).from(collections);

    const totalCollectors = await db.select({ 
      count: sql<number>`count(*)` 
    }).from(users).where(eq(users.role, 'collector'));

    // Mix in client-side metrics passed from the dashboard state listener loop
    const dbRevenue = Number(totalRevenue[0]?.sum) || 0;
    const dbCollectionsCount = Number(totalCollections[0]?.count) || 0;

    const localRevenue = localTransactions.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
    const localCollectionsCount = localTransactions.length;

    return {
      revenue: dbRevenue + localRevenue,
      collections: dbCollectionsCount + localCollectionsCount,
      collectors: Number(totalCollectors[0]?.count) || 0
    };
  } catch (error) {
    console.error("Stats Fetch Error:", error);
    return { revenue: 0, collections: 0, collectors: 0 };
  }
}

/**
 * 4. GET TRANSACTION HISTORY (For individual Collectors)
 */
export async function getTransactionHistory(userId: string | number) {
  try {
    const numericId = typeof userId === "string" ? parseInt(userId, 10) : userId;
    if (isNaN(numericId)) throw new Error("Invalid User ID provided");

    const history = await db
      .select()
      .from(collections)
      .where(eq(collections.collectorId, numericId))
      .orderBy(desc(collections.createdAt))
      .limit(20);

    return { success: true, data: history };
  } catch (error) {
    console.error("Fetch History Error:", error);
    return { success: false, error: "Failed to load history" };
  }
}

/**
 * 5. GET ALL COLLECTIONS (For Admin Overview Table)
 * MIXED STATE RULE: Prepend live client data store mutations before historic DB entries.
 */
export async function getAllCollections(localTransactions: any[] = []) {
  try {
    const dbResults = await db
      .select({
        id: collections.id,
        receiptId: collections.receiptId,
        supplierId: collections.supplierId,
        categoryId: collections.categoryId,
        collectorId: collections.collectorId,
        quantity: collections.quantity,
        totalAmount: collections.totalAmount,
        amount: collections.totalAmount, // Alias to support clean amount formatting fields
        createdAt: collections.createdAt,
        collectorName: users.fullName, 
      })
      .from(collections)
      .leftJoin(users, eq(collections.collectorId, users.id))
      .orderBy(desc(collections.createdAt));

    // Map database properties safely
    const normalizedDbData = (dbResults ?? []).map(item => ({
      ...item,
      amount: Number(item.totalAmount || item.amount || 0),
      createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString()
    }));

    // Merge: New client collections sit right at the top of the table display stream
    return [...localTransactions, ...normalizedDbData];
  } catch (error) {
    console.error("Admin Fetch Error:", error);
    return localTransactions ?? [];
  }
}

/**
 * 6. SAVE COLLECTION
 */
export async function saveCollection(data: {
  receiptId: string;
  supplierId: string | number;
  categoryId: string | number;
  collectorId: string | number;
  quantity: string | number;
  totalAmount: string | number;
}) {
  try {
    const cleanedValues = {
      receiptId: data.receiptId.trim(),
      supplierId: Number(data.supplierId),
      categoryId: Number(data.categoryId),
      collectorId: Number(data.collectorId),
      quantity: Number(data.quantity),
      totalAmount: Number(data.totalAmount),
      createdAt: new Date(),
    };

    if (isNaN(cleanedValues.collectorId) || isNaN(cleanedValues.totalAmount)) {
      console.error("Validation failed: collectorId or totalAmount parsed as NaN", data);
      return { success: false, error: "Invalid numerical transaction details provided." };
    }

    const newRecord = await db.insert(collections).values(cleanedValues).returning();
    
    revalidatePath("/", "layout");

    return { success: true, data: newRecord[0] };
  } catch (error: any) {
    console.error("Save Collection Error:", error);
    return { success: false, error: "Failed to save collection: " + (error.message || "") };
  }
}

/**
 * 7. UTILITY: GET SUPPLIERS & CATEGORIES
 */
export async function getFormData() {
  try {
    const allSuppliers = await db.select().from(suppliers);
    const allCategories = await db.select().from(productCategories);
    return { suppliers: allSuppliers, categories: allCategories };
  } catch (error) {
    console.error("Form Data Error:", error);
    return { suppliers: [], categories: [] };
  }
}

/**
 * 8. GET USERS FOR DIRECTORY
 */
export async function getAdminUsers() {
  try {
    const usersList = await db.select()
      .from(users)
      .orderBy(desc(users.createdAt));

    return Array.isArray(usersList) ? usersList : [];
  } catch (error) {
    console.error("Fetch Directory Error:", error);
    return [];
  }
}

/**
 * 9. DELETE USER (Revoke Access)
 */
export async function deleteUser(userId: string | number) {
  try {
    const numericId = typeof userId === "string" ? parseInt(userId, 10) : userId;
    if (isNaN(numericId)) throw new Error("Invalid User ID provided");

    await db.delete(users).where(eq(users.id, numericId));
    
    revalidatePath("/", "layout");

    return { success: true };
  } catch (error) {
    console.error("Delete User Error:", error);
    return { success: false, error: "Failed to revoke staff access" };
  }
}