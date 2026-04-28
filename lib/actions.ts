"use server"

import { db } from "./db"; 
import { transactions } from "./db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache"; // CRITICAL for UI updates

export async function saveTransaction(data: any) {
  try {
    const newEntry = {
      vendorName: String(data.vendorName),
      supplierPhone: String(data.supplierPhone),
      amount: Math.round(Number(data.amount)), 
      paymentMethod: String(data.paymentMethod),
      paymentReference: String(data.paymentReference),
      collectorId: String(data.collectorId),
      collectorName: String(data.collectorName),
      categoryName: String(data.categoryName),
    };

    const result = await db.insert(transactions).values(newEntry).returning();
    
    console.log(`✅ [DB SAVE] ID: ${result[0].id} for Collector: ${data.collectorId}`);

    // This forces the dashboard to refresh the list immediately
    revalidatePath("/"); 
    
    return result[0];
  } catch (error) {
    console.error("❌ [DB SAVE ERROR]:", error);
    throw new Error("Failed to save to database");
  }
}

export async function getTransactionHistory(collectorId: string) {
  try {
    if (!collectorId) return [];

    console.log(`🔍 [FETCH] Searching history for static ID: ${collectorId}`);

    const history = await db
      .select()
      .from(transactions)
      .where(eq(transactions.collectorId, collectorId))
      .orderBy(desc(transactions.createdAt));

    return history;
  } catch (error) {
    console.error("❌ [FETCH ERROR]:", error);
    return [];
  }
}

export async function getAllTransactions() {
  return await db
    .select()
    .from(transactions)
    .orderBy(desc(transactions.createdAt));
}