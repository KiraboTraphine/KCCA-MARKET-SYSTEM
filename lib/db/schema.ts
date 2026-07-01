import { pgTable, serial, text, integer, timestamp, varchar, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 1. USERS: Updated to Email-based Identity
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  // Switched from staffNumber to email
  email: varchar("email", { length: 255 }).unique().notNull(), 
  role: text("role").$type<"admin" | "collector">().default("collector").notNull(),
  passwordHash: text("password_hash").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdById: integer("created_by_id"), 
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 2. SUPPLIERS: Tracking by Vehicle Plate
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phoneNumber: varchar("phone_number", { length: 15 }),
  vehiclePlate: varchar("vehicle_plate", { length: 20 }).unique().notNull(),
  nin: varchar("nin", { length: 14 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3. PRODUCT_CATEGORIES: Unit-based tax rates
export const productCategories = pgTable("product_categories", {
  id: serial("id").primaryKey(),
  categoryName: text("category_name").notNull(), 
  unitType: text("unit_type").notNull(),        
  taxPerUnit: integer("tax_per_unit").notNull(), 
});

// 4. COLLECTIONS: The Financial Ledger
export const collections = pgTable("collections", {
  id: serial("id").primaryKey(),
  receiptId: varchar("receipt_id", { length: 12 }).unique().notNull(),
  
  supplierId: integer("supplier_id").references(() => suppliers.id).notNull(),
  categoryId: integer("category_id").references(() => productCategories.id).notNull(),
  collectorId: integer("collector_id").references(() => users.id).notNull(),
  
  quantity: integer("quantity").notNull(),
  totalAmount: integer("total_amount").notNull(), 
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations for easier querying
export const usersRelations = relations(users, ({ many }) => ({
  collections: many(collections),
}));

export const collectionsRelations = relations(collections, ({ one }) => ({
  supplier: one(suppliers, { fields: [collections.supplierId], references: [suppliers.id] }),
  category: one(productCategories, { fields: [collections.categoryId], references: [productCategories.id] }),
  collector: one(users, { fields: [collections.collectorId], references: [users.id] }),
}));