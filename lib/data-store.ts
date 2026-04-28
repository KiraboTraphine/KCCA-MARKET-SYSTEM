// lib/data-store.ts

export interface Category {
  id: string
  name: string
  pricePerUnit: number
  unit: string
}

export interface Transaction {
  id: string
  receiptId: string
  category?: string
  categoryName: string
  quantity: number
  amount: number
  vendorName: string
  supplierPhone: string
  paymentMethod: "mobile_money" | "bank" | "pay_code"
  paymentReference: string
  collectorId: string
  collectorName: string
  createdAt: string
  timestamp: string
  verified: boolean
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "1", name: "Tomatoes (Crate)", pricePerUnit: 5000, unit: "crate" },
  { id: "2", name: "Bananas (Bunch)", pricePerUnit: 3000, unit: "bunch" },
  { id: "3", name: "Cabbages (Head)", pricePerUnit: 2000, unit: "head" },
  { id: "4", name: "Onions (Bag)", pricePerUnit: 8000, unit: "bag" },
  { id: "5", name: "Potatoes (Bag)", pricePerUnit: 15000, unit: "bag" },
  { id: "6", name: "Matooke (Bunch)", pricePerUnit: 10000, unit: "bunch" },
  { id: "7", name: "Vegetables (Bundle)", pricePerUnit: 1500, unit: "bundle" },
  { id: "8", name: "Fruits (Basket)", pricePerUnit: 4000, unit: "basket" },
]

const TRANSACTIONS_KEY = "kcca_transactions"
const CATEGORIES_KEY = "kcca_categories"

/**
 * HELPER: Normalizes Receipt IDs for reliable matching.
 */
const normalizeId = (id: string = ""): string => {
  const clean = id.toString().trim().toUpperCase()
  // If QR contains "KCCA-VERIFY:ID", extract just the ID
  if (clean.includes(":")) {
    const parts = clean.split(":")
    return parts[parts.length - 1]
  }
  return clean.startsWith("KCCA-") ? clean : `KCCA-${clean}`
}

// --- UTILITY EXPORTS ---

export function generatePayCode(): string {
  return Math.random().toString().substring(2, 10)
}

/**
 * UPDATED: Generates a simple 4-digit ID for better scanning and typing.
 * This fixes the issue where IDs were too long to scan or remember.
 */
export function generateReceiptId(): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000)
  return `KCCA-${randomNum}`
}

// --- CATEGORY FUNCTIONS ---

export function getCategories(): Category[] {
  if (typeof window === "undefined") return DEFAULT_CATEGORIES
  const stored = localStorage.getItem(CATEGORIES_KEY)
  if (!stored) {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(DEFAULT_CATEGORIES))
    return DEFAULT_CATEGORIES
  }
  return JSON.parse(stored)
}

// --- TRANSACTION FUNCTIONS ---

export function getTransactions(): Transaction[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(TRANSACTIONS_KEY)
  return stored ? JSON.parse(stored) : []
}

export function createTransaction(data: any): Transaction {
  const transactions = getTransactions()
  const now = new Date().toISOString()
  
  // Ensure the ID is normalized BEFORE saving
  const finalReceiptId = normalizeId(data.receiptId || generateReceiptId())

  const newTransaction: Transaction = {
    ...data,
    id: data.id || crypto.randomUUID(),
    receiptId: finalReceiptId,
    createdAt: now,
    timestamp: now,
    verified: true, 
  }
  
  transactions.push(newTransaction)
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions))
  return newTransaction
}

export function verifyReceipt(receiptId: string): Transaction | null {
  const transactions = getTransactions()
  const targetId = normalizeId(receiptId)
  
  // Cross-normalize both sides for 100% match accuracy
  return transactions.find((t) => normalizeId(t.receiptId) === targetId) || null
}

// --- STATISTICS ---

export function getTodayTransactions(): Transaction[] {
  const transactions = getTransactions()
  const today = new Date().toDateString()
  return transactions.filter((t) => new Date(t.createdAt).toDateString() === today)
}

export function getTodayRevenue(): number {
  return getTodayTransactions().reduce((sum, t) => sum + t.amount, 0)
}

export function getCollectorTransactions(collectorId: string): Transaction[] {
  return getTransactions().filter((t) => t.collectorId === collectorId)
}

export function getAllTransactions(): Transaction[] {
  return getTransactions()
}