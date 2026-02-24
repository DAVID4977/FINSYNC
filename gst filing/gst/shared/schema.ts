import { mysqlTable, varchar, text, timestamp, boolean, int, decimal, json } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table with authentication
export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  company: varchar("company", { length: 255 }),
  gstin: varchar("gstin", { length: 15 }), // GST Identification Number
  panNumber: varchar("pan_number", { length: 10 }),
  avatar: text("avatar"),
  password: varchar("password", { length: 255 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 15 }),
  address: text("address"),
  role: varchar("role", { length: 50 }).default("user"), // user, admin, accountant
  isActive: boolean("is_active").default(true),
  isEmailVerified: boolean("is_email_verified").default(false),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User sessions for authentication
export const userSessions = mysqlTable("user_sessions", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).references(() => users.id, { onDelete: "cascade" }).notNull(),
  sessionToken: varchar("session_token", { length: 255 }).notNull().unique(),
  deviceInfo: text("device_info"),
  ipAddress: varchar("ip_address", { length: 45 }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// GST Returns
export const gstReturns = mysqlTable("gst_returns", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).references(() => users.id, { onDelete: "cascade" }).notNull(),
  returnType: varchar("return_type", { length: 20 }).notNull(), // GSTR-1, GSTR-3B, etc.
  period: varchar("period", { length: 7 }).notNull(), // MM-YYYY
  financialYear: varchar("financial_year", { length: 9 }).notNull(), // 2023-2024
  status: varchar("status", { length: 20 }).notNull(), // Filed, Pending, Draft
  totalTurnover: decimal("total_turnover", { precision: 15, scale: 2 }),
  totalTax: decimal("total_tax", { precision: 15, scale: 2 }),
  igstAmount: decimal("igst_amount", { precision: 15, scale: 2 }),
  cgstAmount: decimal("cgst_amount", { precision: 15, scale: 2 }),
  sgstAmount: decimal("sgst_amount", { precision: 15, scale: 2 }),
  cessAmount: decimal("cess_amount", { precision: 15, scale: 2 }),
  returnData: json("return_data"),
  acknowledgeNumber: varchar("acknowledge_number", { length: 50 }),
  filedAt: timestamp("filed_at"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Invoices
export const invoices = mysqlTable("invoices", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).references(() => users.id, { onDelete: "cascade" }).notNull(),
  gstReturnId: varchar("gst_return_id", { length: 36 }).references(() => gstReturns.id),
  invoiceNumber: varchar("invoice_number", { length: 100 }).notNull(),
  invoiceDate: timestamp("invoice_date").notNull(),
  invoiceType: varchar("invoice_type", { length: 20 }).default("B2B"),
  gstin: varchar("gstin", { length: 15 }),
  buyerName: varchar("buyer_name", { length: 255 }),
  buyerAddress: text("buyer_address"),
  buyerState: varchar("buyer_state", { length: 50 }),
  placeOfSupply: varchar("place_of_supply", { length: 50 }),
  reverseCharge: boolean("reverse_charge").default(false),
  invoiceValue: decimal("invoice_value", { precision: 15, scale: 2 }),
  taxableValue: decimal("taxable_value", { precision: 15, scale: 2 }),
  igstRate: decimal("igst_rate", { precision: 5, scale: 2 }),
  igstAmount: decimal("igst_amount", { precision: 15, scale: 2 }),
  cgstRate: decimal("cgst_rate", { precision: 5, scale: 2 }),
  cgstAmount: decimal("cgst_amount", { precision: 15, scale: 2 }),
  sgstRate: decimal("sgst_rate", { precision: 5, scale: 2 }),
  sgstAmount: decimal("sgst_amount", { precision: 15, scale: 2 }),
  cessRate: decimal("cess_rate", { precision: 5, scale: 2 }),
  cessAmount: decimal("cess_amount", { precision: 15, scale: 2 }),
  hsnCode: varchar("hsn_code", { length: 10 }),
  itemDescription: text("item_description"),
  quantity: decimal("quantity", { precision: 15, scale: 3 }),
  unit: varchar("unit", { length: 20 }),
  status: varchar("status", { length: 20 }).default("processed"),
  fileName: varchar("file_name", { length: 255 }),
  extractedData: json("extracted_data"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Uploaded Files
export const uploadedFiles = mysqlTable("uploaded_files", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).references(() => users.id, { onDelete: "cascade" }).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  fileSize: int("file_size"),
  fileType: varchar("file_type", { length: 50 }),
  mimeType: varchar("mime_type", { length: 100 }),
  filePath: text("file_path"),
  status: varchar("status", { length: 20 }).default("processing"),
  extractedData: json("extracted_data"),
  extractionLog: text("extraction_log"),
  invoicesExtracted: int("invoices_extracted").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Download History
export const downloadHistory = mysqlTable("download_history", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).references(() => users.id, { onDelete: "cascade" }).notNull(),
  filename: varchar("filename", { length: 255 }).notNull(),
  fileType: varchar("file_type", { length: 50 }).notNull().default("excel"),
  downloadType: varchar("download_type", { length: 50 }).notNull(),
  period: varchar("period", { length: 7 }),
  invoicesCount: int("invoices_count").default(0),
  fileSize: int("file_size"),
  filePath: text("file_path"),
  downloadedAt: timestamp("downloaded_at").defaultNow(),
});

// Compliance History
export const complianceHistory = mysqlTable("compliance_history", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).references(() => users.id, { onDelete: "cascade" }).notNull(),
  complianceType: varchar("compliance_type", { length: 50 }).notNull(),
  period: varchar("period", { length: 7 }).notNull(),
  dueDate: timestamp("due_date").notNull(),
  filedDate: timestamp("filed_date"),
  status: varchar("status", { length: 20 }).notNull(),
  penaltyAmount: decimal("penalty_amount", { precision: 15, scale: 2 }),
  remarks: text("remarks"),
  documentId: varchar("document_id", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Audit Logs
export const auditLogs = mysqlTable("audit_logs", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }).notNull(),
  entityId: varchar("entity_id", { length: 36 }),
  oldData: json("old_data"),
  newData: json("new_data"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Government Portal Users (separate from main users)
export const govPortalUsers = mysqlTable("gov_portal_users", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  username: varchar("username", { length: 100 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  gstin: varchar("gstin", { length: 15 }).notNull(),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  panNumber: varchar("pan_number", { length: 10 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 15 }),
  address: text("address"),
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Government Portal Sessions
export const govPortalSessions = mysqlTable("gov_portal_sessions", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).references(() => govPortalUsers.id, { onDelete: "cascade" }).notNull(),
  sessionToken: varchar("session_token", { length: 500 }).notNull().unique(),
  deviceInfo: text("device_info"),
  ipAddress: varchar("ip_address", { length: 45 }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Government Portal File Uploads
export const govPortalUploads = mysqlTable("gov_portal_uploads", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).references(() => govPortalUsers.id, { onDelete: "cascade" }).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  fileSize: int("file_size"),
  fileType: varchar("file_type", { length: 50 }),
  returnType: varchar("return_type", { length: 20 }).notNull(), // GSTR1, GSTR2, GSTR3B
  financialYear: varchar("financial_year", { length: 9 }).notNull(),
  period: varchar("period", { length: 7 }).notNull(), // MM-YYYY
  quarter: varchar("quarter", { length: 20 }),
  referenceNumber: varchar("reference_number", { length: 50 }),
  status: varchar("status", { length: 20 }).default("submitted"), // submitted, processing, accepted, rejected
  uploadedData: json("uploaded_data"),
  acknowledgmentNumber: varchar("acknowledgment_number", { length: 50 }),
  submittedAt: timestamp("submitted_at").defaultNow(),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations for government portal tables
export const govPortalUsersRelations = relations(govPortalUsers, ({ many }) => ({
  sessions: many(govPortalSessions),
  uploads: many(govPortalUploads),
}));

export const govPortalSessionsRelations = relations(govPortalSessions, ({ one }) => ({
  user: one(govPortalUsers, {
    fields: [govPortalSessions.userId],
    references: [govPortalUsers.id],
  }),
}));

export const govPortalUploadsRelations = relations(govPortalUploads, ({ one }) => ({
  user: one(govPortalUsers, {
    fields: [govPortalUploads.userId],
    references: [govPortalUsers.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  name: true,
  company: true,
  gstin: true,
  panNumber: true,
  password: true,
  phoneNumber: true,
  address: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const insertGstReturnSchema = createInsertSchema(gstReturns).pick({
  returnType: true,
  period: true,
  financialYear: true,
  status: true,
  totalTurnover: true,
  totalTax: true,
  igstAmount: true,
  cgstAmount: true,
  sgstAmount: true,
  cessAmount: true,
  dueDate: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).pick({
  invoiceNumber: true,
  invoiceDate: true,
  invoiceType: true,
  gstin: true,
  buyerName: true,
  buyerAddress: true,
  buyerState: true,
  placeOfSupply: true,
  invoiceValue: true,
  taxableValue: true,
  igstRate: true,
  igstAmount: true,
  cgstRate: true,
  cgstAmount: true,
  sgstRate: true,
  sgstAmount: true,
  cessRate: true,
  cessAmount: true,
  hsnCode: true,
  itemDescription: true,
  quantity: true,
  unit: true,
  fileName: true,
});

export const insertUploadedFileSchema = createInsertSchema(uploadedFiles).pick({
  fileName: true,
  originalName: true,
  fileSize: true,
  fileType: true,
  mimeType: true,
  extractedData: true,
});

export const insertDownloadHistorySchema = createInsertSchema(downloadHistory).pick({
  filename: true,
  fileType: true,
  downloadType: true,
  period: true,
  invoicesCount: true,
  fileSize: true,
});

// Government Portal Schemas
export const insertGovPortalUserSchema = createInsertSchema(govPortalUsers).pick({
  username: true,
  email: true,
  password: true,
  gstin: true,
  companyName: true,
  panNumber: true,
  phoneNumber: true,
  address: true,
});

export const govPortalLoginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

export const insertGovPortalUploadSchema = createInsertSchema(govPortalUploads).pick({
  fileName: true,
  originalName: true,
  fileSize: true,
  fileType: true,
  returnType: true,
  financialYear: true,
  period: true,
  quarter: true,
  uploadedData: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;

export type UserSession = typeof userSessions.$inferSelect;

export type GstReturn = typeof gstReturns.$inferSelect;
export type InsertGstReturn = z.infer<typeof insertGstReturnSchema>;

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

export type UploadedFile = typeof uploadedFiles.$inferSelect;
export type InsertUploadedFile = z.infer<typeof insertUploadedFileSchema>;

export type DownloadHistory = typeof downloadHistory.$inferSelect;
export type InsertDownloadHistory = z.infer<typeof insertDownloadHistorySchema>;

export type ComplianceHistory = typeof complianceHistory.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;

// Government Portal Types
export type GovPortalUser = typeof govPortalUsers.$inferSelect;
export type InsertGovPortalUser = z.infer<typeof insertGovPortalUserSchema>;
export type GovPortalLoginCredentials = z.infer<typeof govPortalLoginSchema>;

export type GovPortalSession = typeof govPortalSessions.$inferSelect;

export type GovPortalUpload = typeof govPortalUploads.$inferSelect;
export type InsertGovPortalUpload = z.infer<typeof insertGovPortalUploadSchema>;