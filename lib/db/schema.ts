import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  vendorName: text("vendor_name").notNull(),
  supplierPhone: text("supplier_phone").notNull(),
  amount: integer("amount").notNull(),
  paymentMethod: text("payment_method").notNull(),
  paymentReference: text("payment_reference"),
  collectorId: text("collector_id").notNull(),
  collectorName: text("collector_name").notNull(),
  categoryName: text("category_name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});