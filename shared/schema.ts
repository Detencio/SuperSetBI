import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Multi-tenancy schema
export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: varchar("slug").notNull().unique(), // URL-friendly identifier
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),
  website: text("website"),
  industry: text("industry"),
  size: text("size"), // "small", "medium", "large", "enterprise"
  logo: text("logo"), // URL to company logo
  settings: text("settings"), // JSON configuration
  subscription: text("subscription").notNull().default("trial"), // "trial", "basic", "pro", "enterprise"
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  maxUsers: integer("max_users").default(5),
  maxStorage: integer("max_storage").default(1000), // MB
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const companyInvitations = pgTable("company_invitations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("user"), // "admin", "manager", "user", "viewer"
  invitedBy: varchar("invited_by").notNull(),
  token: varchar("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  acceptedAt: timestamp("accepted_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("user"), // "super_admin", "company_admin", "manager", "user", "viewer"
  permissions: text("permissions"), // JSON array of specific permissions
  lastLoginAt: timestamp("last_login_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dashboards = pgTable("dashboards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull(),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // "executive", "inventory", "collections", "sales"
  config: text("config"), // JSON configuration
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const suppliers = pgTable("suppliers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull(),
  name: text("name").notNull(),
  contactName: text("contact_name"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  leadTime: integer("lead_time").default(7), // days
  reliability: decimal("reliability", { precision: 5, scale: 2 }).default("95.00"), // percentage
  createdAt: timestamp("created_at").defaultNow(),
});

export const warehouses = pgTable("warehouses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull(),
  name: text("name").notNull(),
  location: text("location"),
  capacity: integer("capacity"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull(),
  sku: text("sku").unique(),
  name: text("name").notNull(),
  categoryId: varchar("category_id"),
  supplierId: varchar("supplier_id"),
  warehouseId: varchar("warehouse_id"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }),
  stock: integer("stock").notNull(),
  minStock: integer("min_stock").default(10),
  maxStock: integer("max_stock").default(1000),
  safetyStock: integer("safety_stock").default(5),
  reorderPoint: integer("reorder_point").default(15),
  location: text("location"), // physical location in warehouse
  unitMeasure: text("unit_measure").default("unidad"),
  weight: decimal("weight", { precision: 8, scale: 2 }),
  dimensions: text("dimensions"),
  expirationDate: timestamp("expiration_date"),
  lastMovementDate: timestamp("last_movement_date"),
  abcClassification: text("abc_classification").default("C"), // A, B, C
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  
  // Advanced analytics fields
  demandForecast: decimal("demand_forecast", { precision: 10, scale: 2 }).default("0"),
  seasonalityFactor: decimal("seasonality_factor", { precision: 5, scale: 2 }).default("1.00"),
  defectRate: decimal("defect_rate", { precision: 5, scale: 2 }).default("0.00"),
  shrinkageRate: decimal("shrinkage_rate", { precision: 5, scale: 2 }).default("0.00"),
  storagecost: decimal("storage_cost", { precision: 8, scale: 2 }).default("0.00"),
  orderingCost: decimal("ordering_cost", { precision: 8, scale: 2 }).default("0.00"),
  daysWithoutMovement: integer("days_without_movement").default(0),
});

export const sales = pgTable("sales", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull(),
  productId: varchar("product_id").notNull(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email"),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("completed"), // "pending", "completed", "cancelled"
  saleDate: timestamp("sale_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const inventoryMovements = pgTable("inventory_movements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull(),
  productId: varchar("product_id").notNull(),
  warehouseId: varchar("warehouse_id"),
  movementType: text("movement_type").notNull(), // "entrada", "salida", "transferencia", "ajuste"
  quantity: integer("quantity").notNull(),
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }),
  totalValue: decimal("total_value", { precision: 10, scale: 2 }),
  reason: text("reason"), // sale, purchase, adjustment, transfer, return
  documentNumber: text("document_number"),
  referenceId: varchar("reference_id"), // related sale, purchase, etc.
  userId: varchar("user_id"),
  notes: text("notes"),
  movementDate: timestamp("movement_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const stockAlerts = pgTable("stock_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull(),
  productId: varchar("product_id").notNull(),
  alertType: text("alert_type").notNull(), // "low_stock", "out_of_stock", "excess_stock", "expiring"
  priority: text("priority").notNull().default("medium"), // "low", "medium", "high", "critical"
  message: text("message").notNull(),
  threshold: integer("threshold"),
  currentValue: integer("current_value"),
  isResolved: boolean("is_resolved").default(false),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced entities for complete data ingestion

export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  postalCode: text("postal_code"),
  customerType: text("customer_type").notNull().default("individual"), // "individual", "business"
  creditLimit: decimal("credit_limit", { precision: 10, scale: 2 }).default("0.00"),
  paymentTerms: integer("payment_terms").default(30), // days
  registrationDate: timestamp("registration_date").defaultNow(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const salespeople = pgTable("salespeople", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  territory: text("territory"),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default("0.00"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced sales table
export const enhancedSales = pgTable("enhanced_sales", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull(),
  invoiceNumber: text("invoice_number").unique().notNull(),
  customerId: varchar("customer_id").notNull(),
  salespersonId: varchar("salesperson_id"),
  saleDate: timestamp("sale_date").defaultNow(),
  dueDate: timestamp("due_date"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0.00"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0.00"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentStatus: text("payment_status").notNull().default("pending"), // "pending", "partial", "paid", "overdue"
  paymentMethod: text("payment_method"), // "cash", "card", "transfer", "check", "credit"
  channel: text("channel").default("store"), // "store", "online", "phone", "app"
  currency: text("currency").default("USD"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const saleItems = pgTable("sale_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull(),
  saleId: varchar("sale_id").notNull(),
  productId: varchar("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  discountPercentage: decimal("discount_percentage", { precision: 5, scale: 2 }).default("0.00"),
  lineTotal: decimal("line_total", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced collections/receivables
export const accountsReceivable = pgTable("accounts_receivable", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull(),
  customerId: varchar("customer_id").notNull(),
  invoiceId: varchar("invoice_id").notNull(),
  invoiceDate: timestamp("invoice_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  originalAmount: decimal("original_amount", { precision: 10, scale: 2 }).notNull(),
  outstandingAmount: decimal("outstanding_amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("USD"),
  agingDays: integer("aging_days").default(0),
  status: text("status").notNull().default("current"), // "current", "overdue_30", "overdue_60", "overdue_90", "overdue_120+"
  priority: text("priority").default("low"), // "low", "medium", "high", "critical"
  collectionAgent: text("collection_agent"),
  lastContactDate: timestamp("last_contact_date"),
  nextContactDate: timestamp("next_contact_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull(),
  customerId: varchar("customer_id").notNull(),
  invoiceId: varchar("invoice_id"),
  paymentDate: timestamp("payment_date").defaultNow(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(), // "cash", "check", "transfer", "card"
  reference: text("reference"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const collectionActivities = pgTable("collection_activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull(),
  customerId: varchar("customer_id").notNull(),
  invoiceId: varchar("invoice_id"),
  activityType: text("activity_type").notNull(), // "call", "email", "letter", "visit", "promise", "payment"
  activityDate: timestamp("activity_date").defaultNow(),
  agent: text("agent").notNull(),
  notes: text("notes"),
  result: text("result"), // "contacted", "no_answer", "promise", "dispute", "paid"
  followUpDate: timestamp("follow_up_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Data import tracking
export const dataImports = pgTable("data_imports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull(),
  userId: varchar("user_id").notNull(),
  importType: text("import_type").notNull(), // "api", "csv", "excel", "json"
  dataType: text("data_type").notNull(), // "inventory", "sales", "collections"
  fileName: text("file_name"),
  totalRecords: integer("total_records").default(0),
  processedRecords: integer("processed_records").default(0),
  successfulRecords: integer("successful_records").default(0),
  failedRecords: integer("failed_records").default(0),
  status: text("status").notNull().default("pending"), // "pending", "processing", "completed", "failed"
  errorLog: text("error_log"),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Keep existing collections table for backward compatibility
export const collections = pgTable("collections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull(),
  saleId: varchar("sale_id").notNull(),
  customerName: text("customer_name").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  dueDate: timestamp("due_date").notNull(),
  status: text("status").notNull().default("pending"), // "pending", "paid", "overdue", "cancelled"
  paymentDate: timestamp("payment_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertDashboardSchema = createInsertSchema(dashboards).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertSaleSchema = createInsertSchema(sales).omit({
  id: true,
  createdAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  createdAt: true,
});

export const insertWarehouseSchema = createInsertSchema(warehouses).omit({
  id: true,
  createdAt: true,
});

export const insertInventoryMovementSchema = createInsertSchema(inventoryMovements).omit({
  id: true,
  createdAt: true,
});

export const insertStockAlertSchema = createInsertSchema(stockAlerts).omit({
  id: true,
  createdAt: true,
});

export const insertCollectionSchema = createInsertSchema(collections).omit({
  id: true,
  createdAt: true,
});

// New insert schemas for enhanced entities
export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
});

export const insertSalespersonSchema = createInsertSchema(salespeople).omit({
  id: true,
  createdAt: true,
});

export const insertEnhancedSaleSchema = createInsertSchema(enhancedSales).omit({
  id: true,
  createdAt: true,
});

export const insertSaleItemSchema = createInsertSchema(saleItems).omit({
  id: true,
  createdAt: true,
});

export const insertAccountReceivableSchema = createInsertSchema(accountsReceivable).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export const insertCollectionActivitySchema = createInsertSchema(collectionActivities).omit({
  id: true,
  createdAt: true,
});

export const insertDataImportSchema = createInsertSchema(dataImports).omit({
  id: true,
  createdAt: true,
});

// Data ingestion validation schemas
export const bulkProductsSchema = z.object({
  data_type: z.literal("inventory"),
  records: z.array(insertProductSchema),
  metadata: z.object({
    source: z.string(),
    import_date: z.string().optional(),
    total_records: z.number(),
  }).optional(),
});

export const bulkSalesSchema = z.object({
  data_type: z.literal("sales"),
  records: z.array(insertEnhancedSaleSchema),
  sale_items: z.array(insertSaleItemSchema).optional(),
  metadata: z.object({
    source: z.string(),
    import_date: z.string().optional(),
    total_records: z.number(),
  }).optional(),
});

export const bulkCollectionsSchema = z.object({
  data_type: z.literal("collections"),
  records: z.array(insertAccountReceivableSchema),
  metadata: z.object({
    source: z.string(),
    import_date: z.string().optional(),
    total_records: z.number(),
  }).optional(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Dashboard = typeof dashboards.$inferSelect;
export type InsertDashboard = z.infer<typeof insertDashboardSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Warehouse = typeof warehouses.$inferSelect;
export type InsertWarehouse = z.infer<typeof insertWarehouseSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InventoryMovement = typeof inventoryMovements.$inferSelect;
export type InsertInventoryMovement = z.infer<typeof insertInventoryMovementSchema>;
export type StockAlert = typeof stockAlerts.$inferSelect;
export type InsertStockAlert = z.infer<typeof insertStockAlertSchema>;
export type Sale = typeof sales.$inferSelect;
export type InsertSale = z.infer<typeof insertSaleSchema>;
export type Collection = typeof collections.$inferSelect;
export type InsertCollection = z.infer<typeof insertCollectionSchema>;

// New types for enhanced entities
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Salesperson = typeof salespeople.$inferSelect;
export type InsertSalesperson = z.infer<typeof insertSalespersonSchema>;
export type EnhancedSale = typeof enhancedSales.$inferSelect;
export type InsertEnhancedSale = z.infer<typeof insertEnhancedSaleSchema>;
export type SaleItem = typeof saleItems.$inferSelect;
export type InsertSaleItem = z.infer<typeof insertSaleItemSchema>;
export type AccountReceivable = typeof accountsReceivable.$inferSelect;
export type InsertAccountReceivable = z.infer<typeof insertAccountReceivableSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type CollectionActivity = typeof collectionActivities.$inferSelect;
export type InsertCollectionActivity = z.infer<typeof insertCollectionActivitySchema>;
export type DataImport = typeof dataImports.$inferSelect;
export type InsertDataImport = z.infer<typeof insertDataImportSchema>;

// Bulk import types
export type BulkProducts = z.infer<typeof bulkProductsSchema>;
export type BulkSales = z.infer<typeof bulkSalesSchema>;
export type BulkCollections = z.infer<typeof bulkCollectionsSchema>;

// Multi-tenancy schema additions
export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCompanyInvitationSchema = createInsertSchema(companyInvitations).omit({
  id: true,
  createdAt: true,
});

// Relations
export const companyRelations = relations(companies, ({ many }) => ({
  users: many(users),
  products: many(products),
  sales: many(sales),
  customers: many(customers),
  suppliers: many(suppliers),
  warehouses: many(warehouses),
  invitations: many(companyInvitations),
}));

export const userRelations = relations(users, ({ one, many }) => ({
  company: one(companies, {
    fields: [users.companyId],
    references: [companies.id],
  }),
  dashboards: many(dashboards),
  dataImports: many(dataImports),
}));

export const productRelations = relations(products, ({ one, many }) => ({
  company: one(companies, {
    fields: [products.companyId],
    references: [companies.id],
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  supplier: one(suppliers, {
    fields: [products.supplierId],
    references: [suppliers.id],
  }),
  warehouse: one(warehouses, {
    fields: [products.warehouseId],
    references: [warehouses.id],
  }),
  sales: many(sales),
  stockAlerts: many(stockAlerts),
  inventoryMovements: many(inventoryMovements),
}));

// AI Chat System
export const chatConversations = pgTable("chat_conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull(),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(), // Auto-generated from first message
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  messageCount: integer("message_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull(),
  role: text("role").notNull(), // 'user' | 'assistant'
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  tokenCount: integer("token_count"), // Para tracking de consumo
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations for AI Chat
export const chatConversationsRelations = relations(chatConversations, ({ one, many }) => ({
  company: one(companies, {
    fields: [chatConversations.companyId],
    references: [companies.id],
  }),
  user: one(users, {
    fields: [chatConversations.userId],
    references: [users.id],
  }),
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  conversation: one(chatConversations, {
    fields: [chatMessages.conversationId],
    references: [chatConversations.id],
  }),
}));

// Chat schemas
export const insertChatConversationSchema = createInsertSchema(chatConversations);
export const insertChatMessageSchema = createInsertSchema(chatMessages);

// Multi-tenancy types
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;

export type CompanyInvitation = typeof companyInvitations.$inferSelect;
export type InsertCompanyInvitation = z.infer<typeof insertCompanyInvitationSchema>;

// AI Chat types
export type ChatConversation = typeof chatConversations.$inferSelect;
export type InsertChatConversation = z.infer<typeof insertChatConversationSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
