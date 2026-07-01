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
]

const TRANSACTIONS_KEY = "kcca_transactions"
const globalForData = global as unknown as { inMemoryTransactions: Transaction[] }
if (!globalForData.inMemoryTransactions) globalForData.inMemoryTransactions = []

// --- UTILITY FUNCTIONS ---

export function generatePayCode(): string {
  return Math.random().toString().substring(2, 10)
}

export function generateReceiptId(): string {
  return `KCCA-${Math.floor(1000 + Math.random() * 9000)}`
}

// --- CATEGORY FUNCTIONS ---

export function getCategories(): Category[] {
  return DEFAULT_CATEGORIES
}

// --- TRANSACTION FUNCTIONS ---

export function getTransactions(): Transaction[] {
  if (typeof window === "undefined") return globalForData.inMemoryTransactions
  const stored = localStorage.getItem(TRANSACTIONS_KEY)
  return stored ? JSON.parse(stored) : []
}

export function getAllTransactions(): Transaction[] {
  return getTransactions()
}

export function createTransaction(data: any): Transaction {
  const transactions = getTransactions()
  const now = new Date().toISOString()
  
  // Safely grab the calculated cost from either field name option
  const cleanAmount = Number(data.amount || data.totalAmount || 0)
  
  // Explicit mapping structure to maintain exact interface alignment with the Admin side
  const newTransaction: Transaction = {
    id: data.id || Math.random().toString(36).substring(2),
    receiptId: data.receiptId || generateReceiptId(),
    categoryName: data.categoryName || "",
    quantity: Number(data.quantity || 1),
    amount: cleanAmount,
    vendorName: (data.vendorName || "").trim(),
    supplierPhone: (data.supplierPhone || "").trim(),
    paymentMethod: data.paymentMethod || "mobile_money",
    paymentReference: data.paymentReference || "",
    collectorId: data.collectorId || "",
    collectorName: data.collectorName || "",
    createdAt: now,
    timestamp: now,
    verified: true, 
  }
  
  transactions.unshift(newTransaction)
  
  if (typeof window !== "undefined") {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions))
    
    // Dispatches a state window update event if the Admin panel is on the same browser tab shell
    window.dispatchEvent(new Event("local-store-update"))
    window.dispatchEvent(new Event("storage")) 
  }
  
  globalForData.inMemoryTransactions = transactions
  return newTransaction
}

export function verifyReceipt(receiptId: string): Transaction | null {
  const transactions = getTransactions()
  const targetId = receiptId.toString().trim().toUpperCase()
  return transactions.find((t) => t.receiptId.toString().trim().toUpperCase() === targetId) || null
}