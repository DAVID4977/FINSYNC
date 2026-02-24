import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, bigint } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  emailId: varchar("email_id", { length: 30 }).primaryKey(),
  password: varchar("password", { length: 15 }).notNull(),
  companyName: varchar("company_name", { length: 20 }).notNull().unique(),
  phoneNumber: bigint("phone_number", { mode: "number" }).notNull().unique(),
  username: varchar("username", { length: 30 }).unique(),
  invoiceUpload: text("invoice_upload"), // Changed from bytea to text to store JSON
  reports: text("reports"), // Changed from bytea to text to store JSON
});

export const gstReturns = pgTable("gst_returns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.emailId).notNull(),
  returnType: text("return_type").notNull(), // GSTR-1, GSTR-3B, etc.
  period: text("period").notNull(), // MM-YYYY
  status: text("status").notNull(), // Filed, Pending, Draft
  totalTax: text("total_tax"),
  filedAt: timestamp("filed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.emailId).notNull(),
  invoiceNumber: text("invoice_number").notNull(),
  gstin: text("gstin"),
  buyerName: text("buyer_name"),
  amount: text("amount"),
  taxAmount: text("tax_amount"),
  hsnCode: text("hsn_code"),
  status: text("status").default("processed"), // processed, error, pending
  fileName: text("file_name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const uploadedFiles = pgTable("uploaded_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.emailId).notNull(),
  fileName: text("file_name").notNull(),
  fileSize: text("file_size"),
  fileType: text("file_type"),
  status: text("status").default("processing"), // processing, completed, error
  extractedData: text("extracted_data"), // JSON string of extracted data
  createdAt: timestamp("created_at").defaultNow(),
});

export const downloadHistory = pgTable("download_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.emailId).notNull(),
  filename: text("filename").notNull(),
  fileType: text("file_type").notNull().default("excel"),
  invoicesCount: text("invoices_count").default("0"),
  downloadedAt: timestamp("downloaded_at").defaultNow(),
  fileSize: text("file_size"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  emailId: true,
  password: true,
  companyName: true,
  phoneNumber: true,
  username: true,
});

export const insertGstReturnSchema = createInsertSchema(gstReturns).pick({
  returnType: true,
  period: true,
  status: true,
  totalTax: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).pick({
  invoiceNumber: true,
  gstin: true,
  buyerName: true,
  amount: true,
  taxAmount: true,
  hsnCode: true,
  fileName: true,
});

export const insertUploadedFileSchema = createInsertSchema(uploadedFiles).pick({
  fileName: true,
  fileSize: true,
  fileType: true,
  status: true,
  extractedData: true,
});

export const insertDownloadHistorySchema = createInsertSchema(downloadHistory).pick({
  filename: true,
  fileType: true,
  invoicesCount: true,
  fileSize: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type GstReturn = typeof gstReturns.$inferSelect;
export type InsertGstReturn = z.infer<typeof insertGstReturnSchema>;

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

export type UploadedFile = typeof uploadedFiles.$inferSelect;
export type InsertUploadedFile = z.infer<typeof insertUploadedFileSchema>;

export type DownloadHistory = typeof downloadHistory.$inferSelect;
export type InsertDownloadHistory = z.infer<typeof insertDownloadHistorySchema>;
