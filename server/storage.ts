import { 
  type Company, type InsertCompany,
  type CompanyInvitation, type InsertCompanyInvitation,
  type User, type InsertUser, 
  type Dashboard, type InsertDashboard, 
  type Category, type InsertCategory,
  type Supplier, type InsertSupplier,
  type Warehouse, type InsertWarehouse,
  type Product, type InsertProduct, 
  type InventoryMovement, type InsertInventoryMovement,
  type StockAlert, type InsertStockAlert,
  type Sale, type InsertSale, 
  type Collection, type InsertCollection,
  type Customer, type InsertCustomer,
  type Salesperson, type InsertSalesperson,
  type EnhancedSale, type InsertEnhancedSale,
  type SaleItem, type InsertSaleItem,
  type AccountReceivable, type InsertAccountReceivable,
  type Payment, type InsertPayment,
  type CollectionActivity, type InsertCollectionActivity,
  type DataImport, type InsertDataImport,
  companies, companyInvitations, users, dashboards, categories, suppliers, warehouses, products, 
  inventoryMovements, stockAlerts, sales, collections, customers, salespeople, enhancedSales, 
  saleItems, accountsReceivable, payments, collectionActivities, dataImports
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, and, gte, lte, lt, gt, desc, asc } from "drizzle-orm";

export interface IStorage {
  // Companies
  getCompany(id: string): Promise<Company | undefined>;
  getCompanyBySlug(slug: string): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: string, company: Partial<Company>): Promise<Company | undefined>;
  getCompanies(): Promise<Company[]>;
  deactivateCompany(id: string): Promise<void>;
  
  // Company Invitations
  createCompanyInvitation(invitation: InsertCompanyInvitation): Promise<CompanyInvitation>;
  getCompanyInvitation(token: string): Promise<CompanyInvitation | undefined>;
  acceptCompanyInvitation(token: string): Promise<CompanyInvitation | undefined>;
  getCompanyInvitations(companyId: string): Promise<CompanyInvitation[]>;
  
  // Users (now with company context)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUsersByCompany(companyId: string): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User | undefined>;
  
  // Dashboards (company-scoped)
  getDashboards(companyId: string, userId?: string): Promise<Dashboard[]>;
  getDashboard(id: string, companyId: string): Promise<Dashboard | undefined>;
  createDashboard(dashboard: InsertDashboard): Promise<Dashboard>;
  updateDashboard(id: string, dashboard: Partial<Dashboard>, companyId: string): Promise<Dashboard | undefined>;
  
  // Categories (company-scoped)
  getCategories(companyId: string): Promise<Category[]>;
  getCategory(id: string, companyId: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<Category>, companyId: string): Promise<Category | undefined>;
  
  // Suppliers (company-scoped)
  getSuppliers(companyId: string): Promise<Supplier[]>;
  getSupplier(id: string, companyId: string): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: string, supplier: Partial<Supplier>, companyId: string): Promise<Supplier | undefined>;
  
  // Warehouses (company-scoped)
  getWarehouses(companyId: string): Promise<Warehouse[]>;
  getWarehouse(id: string, companyId: string): Promise<Warehouse | undefined>;
  createWarehouse(warehouse: InsertWarehouse): Promise<Warehouse>;
  updateWarehouse(id: string, warehouse: Partial<Warehouse>, companyId: string): Promise<Warehouse | undefined>;
  
  // Products (company-scoped)
  getProducts(companyId: string): Promise<Product[]>;
  getProduct(id: string, companyId: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<Product>, companyId: string): Promise<Product | undefined>;
  getProductsByCategory(categoryId: string, companyId: string): Promise<Product[]>;
  getProductsByWarehouse(warehouseId: string, companyId: string): Promise<Product[]>;
  getProductsBySupplier(supplierId: string, companyId: string): Promise<Product[]>;
  getLowStockProducts(companyId: string): Promise<Product[]>;
  getOutOfStockProducts(companyId: string): Promise<Product[]>;
  getExcessStockProducts(companyId: string): Promise<Product[]>;
  
  // Inventory Movements
  getInventoryMovements(companyId: string): Promise<InventoryMovement[]>;
  getInventoryMovement(id: string): Promise<InventoryMovement | undefined>;
  createInventoryMovement(movement: InsertInventoryMovement): Promise<InventoryMovement>;
  getMovementsByProduct(productId: string): Promise<InventoryMovement[]>;
  getMovementsByDateRange(startDate: Date, endDate: Date): Promise<InventoryMovement[]>;
  
  // Stock Alerts
  getStockAlerts(companyId: string): Promise<StockAlert[]>;
  getStockAlert(id: string): Promise<StockAlert | undefined>;
  createStockAlert(alert: InsertStockAlert): Promise<StockAlert>;
  updateStockAlert(id: string, alert: Partial<StockAlert>): Promise<StockAlert | undefined>;
  getActiveAlerts(companyId: string): Promise<StockAlert[]>;
  getAlertsByProduct(productId: string): Promise<StockAlert[]>;
  
  // Sales
  getSales(companyId: string): Promise<Sale[]>;
  getSale(id: string): Promise<Sale | undefined>;
  createSale(sale: InsertSale): Promise<Sale>;
  getSalesByDateRange(startDate: Date, endDate: Date): Promise<Sale[]>;
  
  // Collections
  getCollections(companyId: string): Promise<Collection[]>;
  getCollection(id: string): Promise<Collection | undefined>;
  createCollection(collection: InsertCollection): Promise<Collection>;
  updateCollection(id: string, collection: Partial<Collection>): Promise<Collection | undefined>;
  getCollectionsByStatus(status: string): Promise<Collection[]>;

  // Enhanced entities for data ingestion
  // Customers
  getCustomers(companyId: string): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, customer: Partial<Customer>): Promise<Customer | undefined>;

  // Salespeople
  getSalespeople(companyId: string): Promise<Salesperson[]>;
  getSalesperson(id: string): Promise<Salesperson | undefined>;
  createSalesperson(salesperson: InsertSalesperson): Promise<Salesperson>;
  updateSalesperson(id: string, salesperson: Partial<Salesperson>): Promise<Salesperson | undefined>;

  // Enhanced Sales
  getEnhancedSales(companyId: string): Promise<EnhancedSale[]>;
  getEnhancedSale(id: string): Promise<EnhancedSale | undefined>;
  createEnhancedSale(sale: InsertEnhancedSale): Promise<EnhancedSale>;
  updateEnhancedSale(id: string, sale: Partial<EnhancedSale>): Promise<EnhancedSale | undefined>;

  // Sale Items
  getSaleItems(companyId: string): Promise<SaleItem[]>;
  getSaleItem(id: string): Promise<SaleItem | undefined>;
  createSaleItem(item: InsertSaleItem): Promise<SaleItem>;
  updateSaleItem(id: string, item: Partial<SaleItem>): Promise<SaleItem | undefined>;
  getSaleItemsBySale(saleId: string): Promise<SaleItem[]>;

  // Accounts Receivable
  getAccountsReceivable(companyId: string): Promise<AccountReceivable[]>;
  getAccountReceivable(id: string): Promise<AccountReceivable | undefined>;
  createAccountReceivable(receivable: InsertAccountReceivable): Promise<AccountReceivable>;
  updateAccountReceivable(id: string, receivable: Partial<AccountReceivable>): Promise<AccountReceivable | undefined>;

  // Payments
  getPayments(companyId: string): Promise<Payment[]>;
  getPayment(id: string): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: string, payment: Partial<Payment>): Promise<Payment | undefined>;

  // Collection Activities
  getCollectionActivities(companyId: string): Promise<CollectionActivity[]>;
  getCollectionActivity(id: string): Promise<CollectionActivity | undefined>;
  createCollectionActivity(activity: InsertCollectionActivity): Promise<CollectionActivity>;
  updateCollectionActivity(id: string, activity: Partial<CollectionActivity>): Promise<CollectionActivity | undefined>;

  // Data Imports
  getDataImports(filter?: { dataType?: string; limit?: number; companyId?: string }): Promise<DataImport[]>;
  getDataImport(id: string): Promise<DataImport | undefined>;
  createDataImport(importData: InsertDataImport): Promise<DataImport>;
  updateDataImport(id: string, importData: Partial<DataImport>): Promise<DataImport | undefined>;
  
  // Analytics methods
  getInventoryAnalytics(companyId: string): Promise<any>;
  calculateABCClassification(companyId: string): Promise<void>;
  generateStockAlerts(companyId: string): Promise<void>;
}

// DatabaseStorage implementation using Drizzle ORM
export class DatabaseStorage implements IStorage {
  
  // Companies
  async getCompany(id: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }

  async getCompanyBySlug(slug: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.slug, slug));
    return company;
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const [created] = await db.insert(companies).values(company).returning();
    return created;
  }

  async updateCompany(id: string, company: Partial<Company>): Promise<Company | undefined> {
    const [updated] = await db
      .update(companies)
      .set({ ...company, updatedAt: new Date() })
      .where(eq(companies.id, id))
      .returning();
    return updated;
  }

  async getCompanies(): Promise<Company[]> {
    return db.select().from(companies).orderBy(desc(companies.createdAt));
  }

  async deactivateCompany(id: string): Promise<void> {
    await db.update(companies).set({ isActive: false }).where(eq(companies.id, id));
  }

  // Company Invitations
  async createCompanyInvitation(invitation: InsertCompanyInvitation): Promise<CompanyInvitation> {
    const [created] = await db.insert(companyInvitations).values(invitation).returning();
    return created;
  }

  async getCompanyInvitation(token: string): Promise<CompanyInvitation | undefined> {
    const [invitation] = await db
      .select()
      .from(companyInvitations)
      .where(eq(companyInvitations.token, token));
    return invitation;
  }

  async acceptCompanyInvitation(token: string): Promise<CompanyInvitation | undefined> {
    const [updated] = await db
      .update(companyInvitations)
      .set({ acceptedAt: new Date() })
      .where(eq(companyInvitations.token, token))
      .returning();
    return updated;
  }

  async getCompanyInvitations(companyId: string): Promise<CompanyInvitation[]> {
    return db
      .select()
      .from(companyInvitations)
      .where(eq(companyInvitations.companyId, companyId))
      .orderBy(desc(companyInvitations.createdAt));
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUsersByCompany(companyId: string): Promise<User[]> {
    return db.select().from(users).where(eq(users.companyId, companyId));
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async updateUser(id: string, user: Partial<User>): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({ ...user, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  // Dashboards
  async getDashboards(companyId: string, userId?: string): Promise<Dashboard[]> {
    if (userId) {
      return db.select().from(dashboards)
        .where(and(eq(dashboards.companyId, companyId), eq(dashboards.userId, userId)));
    }
    return db.select().from(dashboards).where(eq(dashboards.companyId, companyId));
  }

  async getDashboard(id: string, companyId: string): Promise<Dashboard | undefined> {
    const [dashboard] = await db
      .select()
      .from(dashboards)
      .where(and(eq(dashboards.id, id), eq(dashboards.companyId, companyId)));
    return dashboard;
  }

  async createDashboard(dashboard: InsertDashboard): Promise<Dashboard> {
    const [created] = await db.insert(dashboards).values(dashboard).returning();
    return created;
  }

  async updateDashboard(id: string, dashboard: Partial<Dashboard>, companyId: string): Promise<Dashboard | undefined> {
    const [updated] = await db
      .update(dashboards)
      .set(dashboard)
      .where(and(eq(dashboards.id, id), eq(dashboards.companyId, companyId)))
      .returning();
    return updated;
  }

  // Categories
  async getCategories(companyId: string): Promise<Category[]> {
    return db.select().from(categories).where(eq(categories.companyId, companyId));
  }

  async getCategory(id: string, companyId: string): Promise<Category | undefined> {
    const [category] = await db
      .select()
      .from(categories)
      .where(and(eq(categories.id, id), eq(categories.companyId, companyId)));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [created] = await db.insert(categories).values(category).returning();
    return created;
  }

  async updateCategory(id: string, category: Partial<Category>, companyId: string): Promise<Category | undefined> {
    const [updated] = await db
      .update(categories)
      .set(category)
      .where(and(eq(categories.id, id), eq(categories.companyId, companyId)))
      .returning();
    return updated;
  }

  // Suppliers
  async getSuppliers(companyId: string): Promise<Supplier[]> {
    return db.select().from(suppliers).where(eq(suppliers.companyId, companyId));
  }

  async getSupplier(id: string, companyId: string): Promise<Supplier | undefined> {
    const [supplier] = await db
      .select()
      .from(suppliers)
      .where(and(eq(suppliers.id, id), eq(suppliers.companyId, companyId)));
    return supplier;
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const [created] = await db.insert(suppliers).values(supplier).returning();
    return created;
  }

  async updateSupplier(id: string, supplier: Partial<Supplier>, companyId: string): Promise<Supplier | undefined> {
    const [updated] = await db
      .update(suppliers)
      .set(supplier)
      .where(and(eq(suppliers.id, id), eq(suppliers.companyId, companyId)))
      .returning();
    return updated;
  }

  // Warehouses
  async getWarehouses(companyId: string): Promise<Warehouse[]> {
    return db.select().from(warehouses).where(eq(warehouses.companyId, companyId));
  }

  async getWarehouse(id: string, companyId: string): Promise<Warehouse | undefined> {
    const [warehouse] = await db
      .select()
      .from(warehouses)
      .where(and(eq(warehouses.id, id), eq(warehouses.companyId, companyId)));
    return warehouse;
  }

  async createWarehouse(warehouse: InsertWarehouse): Promise<Warehouse> {
    const [created] = await db.insert(warehouses).values(warehouse).returning();
    return created;
  }

  async updateWarehouse(id: string, warehouse: Partial<Warehouse>, companyId: string): Promise<Warehouse | undefined> {
    const [updated] = await db
      .update(warehouses)
      .set(warehouse)
      .where(and(eq(warehouses.id, id), eq(warehouses.companyId, companyId)))
      .returning();
    return updated;
  }

  // Products
  async getProducts(companyId: string): Promise<Product[]> {
    return db.select().from(products).where(eq(products.companyId, companyId));
  }

  async getProduct(id: string, companyId: string): Promise<Product | undefined> {
    const [product] = await db
      .select()
      .from(products)
      .where(and(eq(products.id, id), eq(products.companyId, companyId)));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [created] = await db.insert(products).values(product).returning();
    return created;
  }

  async updateProduct(id: string, product: Partial<Product>, companyId: string): Promise<Product | undefined> {
    const [updated] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(and(eq(products.id, id), eq(products.companyId, companyId)))
      .returning();
    return updated;
  }

  async getProductsByCategory(categoryId: string, companyId: string): Promise<Product[]> {
    return db
      .select()
      .from(products)
      .where(and(eq(products.categoryId, categoryId), eq(products.companyId, companyId)));
  }

  async getProductsByWarehouse(warehouseId: string, companyId: string): Promise<Product[]> {
    return db
      .select()
      .from(products)
      .where(and(eq(products.warehouseId, warehouseId), eq(products.companyId, companyId)));
  }

  async getProductsBySupplier(supplierId: string, companyId: string): Promise<Product[]> {
    return db
      .select()
      .from(products)
      .where(and(eq(products.supplierId, supplierId), eq(products.companyId, companyId)));
  }

  async getLowStockProducts(companyId: string): Promise<Product[]> {
    return db
      .select()
      .from(products)
      .where(and(eq(products.companyId, companyId), lt(products.stock, products.minStock)));
  }

  async getOutOfStockProducts(companyId: string): Promise<Product[]> {
    return db
      .select()
      .from(products)
      .where(and(eq(products.companyId, companyId), eq(products.stock, 0)));
  }

  async getExcessStockProducts(companyId: string): Promise<Product[]> {
    return db
      .select()
      .from(products)
      .where(and(eq(products.companyId, companyId), gt(products.stock, products.maxStock)));
  }

  // Inventory Movements
  async getInventoryMovements(companyId: string): Promise<InventoryMovement[]> {
    return db.select().from(inventoryMovements).where(eq(inventoryMovements.companyId, companyId));
  }

  async getInventoryMovement(id: string): Promise<InventoryMovement | undefined> {
    const [movement] = await db.select().from(inventoryMovements).where(eq(inventoryMovements.id, id));
    return movement;
  }

  async createInventoryMovement(movement: InsertInventoryMovement): Promise<InventoryMovement> {
    const [created] = await db.insert(inventoryMovements).values(movement).returning();
    return created;
  }

  async getMovementsByProduct(productId: string): Promise<InventoryMovement[]> {
    return db.select().from(inventoryMovements).where(eq(inventoryMovements.productId, productId));
  }

  async getMovementsByDateRange(startDate: Date, endDate: Date): Promise<InventoryMovement[]> {
    return db
      .select()
      .from(inventoryMovements)
      .where(and(gte(inventoryMovements.movementDate, startDate), lte(inventoryMovements.movementDate, endDate)));
  }

  // Stock Alerts
  async getStockAlerts(companyId: string): Promise<StockAlert[]> {
    return db.select().from(stockAlerts).where(eq(stockAlerts.companyId, companyId));
  }

  async getStockAlert(id: string): Promise<StockAlert | undefined> {
    const [alert] = await db.select().from(stockAlerts).where(eq(stockAlerts.id, id));
    return alert;
  }

  async createStockAlert(alert: InsertStockAlert): Promise<StockAlert> {
    const [created] = await db.insert(stockAlerts).values(alert).returning();
    return created;
  }

  async updateStockAlert(id: string, alert: Partial<StockAlert>): Promise<StockAlert | undefined> {
    const [updated] = await db
      .update(stockAlerts)
      .set(alert)
      .where(eq(stockAlerts.id, id))
      .returning();
    return updated;
  }

  async getActiveAlerts(companyId: string): Promise<StockAlert[]> {
    return db
      .select()
      .from(stockAlerts)
      .where(and(eq(stockAlerts.companyId, companyId), eq(stockAlerts.isResolved, false)));
  }

  async getAlertsByProduct(productId: string): Promise<StockAlert[]> {
    return db.select().from(stockAlerts).where(eq(stockAlerts.productId, productId));
  }

  // Sales
  async getSales(companyId: string): Promise<Sale[]> {
    return db.select().from(sales).where(eq(sales.companyId, companyId));
  }

  async getSale(id: string): Promise<Sale | undefined> {
    const [sale] = await db.select().from(sales).where(eq(sales.id, id));
    return sale;
  }

  async createSale(sale: InsertSale): Promise<Sale> {
    const [created] = await db.insert(sales).values(sale).returning();
    return created;
  }

  async getSalesByDateRange(startDate: Date, endDate: Date): Promise<Sale[]> {
    return db
      .select()
      .from(sales)
      .where(and(gte(sales.saleDate, startDate), lte(sales.saleDate, endDate)));
  }

  // Collections
  async getCollections(companyId: string): Promise<Collection[]> {
    return db.select().from(collections).where(eq(collections.companyId, companyId));
  }

  async getCollection(id: string): Promise<Collection | undefined> {
    const [collection] = await db.select().from(collections).where(eq(collections.id, id));
    return collection;
  }

  async createCollection(collection: InsertCollection): Promise<Collection> {
    const [created] = await db.insert(collections).values(collection).returning();
    return created;
  }

  async updateCollection(id: string, collection: Partial<Collection>): Promise<Collection | undefined> {
    const [updated] = await db
      .update(collections)
      .set(collection)
      .where(eq(collections.id, id))
      .returning();
    return updated;
  }

  async getCollectionsByStatus(status: string): Promise<Collection[]> {
    return db.select().from(collections).where(eq(collections.status, status));
  }

  // Enhanced entities
  async getCustomers(companyId: string): Promise<Customer[]> {
    return db.select().from(customers).where(eq(customers.companyId, companyId));
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [created] = await db.insert(customers).values(customer).returning();
    return created;
  }

  async updateCustomer(id: string, customer: Partial<Customer>): Promise<Customer | undefined> {
    const [updated] = await db
      .update(customers)
      .set(customer)
      .where(eq(customers.id, id))
      .returning();
    return updated;
  }

  // Salespeople
  async getSalespeople(companyId: string): Promise<Salesperson[]> {
    return db.select().from(salespeople).where(eq(salespeople.companyId, companyId));
  }

  async getSalesperson(id: string): Promise<Salesperson | undefined> {
    const [salesperson] = await db.select().from(salespeople).where(eq(salespeople.id, id));
    return salesperson;
  }

  async createSalesperson(salesperson: InsertSalesperson): Promise<Salesperson> {
    const [created] = await db.insert(salespeople).values(salesperson).returning();
    return created;
  }

  async updateSalesperson(id: string, salesperson: Partial<Salesperson>): Promise<Salesperson | undefined> {
    const [updated] = await db
      .update(salespeople)
      .set(salesperson)
      .where(eq(salespeople.id, id))
      .returning();
    return updated;
  }

  // Enhanced Sales
  async getEnhancedSales(companyId: string): Promise<EnhancedSale[]> {
    return db.select().from(enhancedSales).where(eq(enhancedSales.companyId, companyId));
  }

  async getEnhancedSale(id: string): Promise<EnhancedSale | undefined> {
    const [sale] = await db.select().from(enhancedSales).where(eq(enhancedSales.id, id));
    return sale;
  }

  async createEnhancedSale(sale: InsertEnhancedSale): Promise<EnhancedSale> {
    const [created] = await db.insert(enhancedSales).values(sale).returning();
    return created;
  }

  async updateEnhancedSale(id: string, sale: Partial<EnhancedSale>): Promise<EnhancedSale | undefined> {
    const [updated] = await db
      .update(enhancedSales)
      .set(sale)
      .where(eq(enhancedSales.id, id))
      .returning();
    return updated;
  }

  // Sale Items
  async getSaleItems(companyId: string): Promise<SaleItem[]> {
    return db.select().from(saleItems).where(eq(saleItems.companyId, companyId));
  }

  async getSaleItem(id: string): Promise<SaleItem | undefined> {
    const [item] = await db.select().from(saleItems).where(eq(saleItems.id, id));
    return item;
  }

  async createSaleItem(item: InsertSaleItem): Promise<SaleItem> {
    const [created] = await db.insert(saleItems).values(item).returning();
    return created;
  }

  async updateSaleItem(id: string, item: Partial<SaleItem>): Promise<SaleItem | undefined> {
    const [updated] = await db
      .update(saleItems)
      .set(item)
      .where(eq(saleItems.id, id))
      .returning();
    return updated;
  }

  async getSaleItemsBySale(saleId: string): Promise<SaleItem[]> {
    return db.select().from(saleItems).where(eq(saleItems.saleId, saleId));
  }

  // Accounts Receivable
  async getAccountsReceivable(companyId: string): Promise<AccountReceivable[]> {
    return db.select().from(accountsReceivable).where(eq(accountsReceivable.companyId, companyId));
  }

  async getAccountReceivable(id: string): Promise<AccountReceivable | undefined> {
    const [receivable] = await db.select().from(accountsReceivable).where(eq(accountsReceivable.id, id));
    return receivable;
  }

  async createAccountReceivable(receivable: InsertAccountReceivable): Promise<AccountReceivable> {
    const [created] = await db.insert(accountsReceivable).values(receivable).returning();
    return created;
  }

  async updateAccountReceivable(id: string, receivable: Partial<AccountReceivable>): Promise<AccountReceivable | undefined> {
    const [updated] = await db
      .update(accountsReceivable)
      .set(receivable)
      .where(eq(accountsReceivable.id, id))
      .returning();
    return updated;
  }

  // Payments
  async getPayments(companyId: string): Promise<Payment[]> {
    return db.select().from(payments).where(eq(payments.companyId, companyId));
  }

  async getPayment(id: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [created] = await db.insert(payments).values(payment).returning();
    return created;
  }

  async updatePayment(id: string, payment: Partial<Payment>): Promise<Payment | undefined> {
    const [updated] = await db
      .update(payments)
      .set(payment)
      .where(eq(payments.id, id))
      .returning();
    return updated;
  }

  // Collection Activities
  async getCollectionActivities(companyId: string): Promise<CollectionActivity[]> {
    return db.select().from(collectionActivities).where(eq(collectionActivities.companyId, companyId));
  }

  async getCollectionActivity(id: string): Promise<CollectionActivity | undefined> {
    const [activity] = await db.select().from(collectionActivities).where(eq(collectionActivities.id, id));
    return activity;
  }

  async createCollectionActivity(activity: InsertCollectionActivity): Promise<CollectionActivity> {
    const [created] = await db.insert(collectionActivities).values(activity).returning();
    return created;
  }

  async updateCollectionActivity(id: string, activity: Partial<CollectionActivity>): Promise<CollectionActivity | undefined> {
    const [updated] = await db
      .update(collectionActivities)
      .set(activity)
      .where(eq(collectionActivities.id, id))
      .returning();
    return updated;
  }

  // Data Imports
  async getDataImports(filter?: { dataType?: string; limit?: number; companyId?: string }): Promise<DataImport[]> {
    const conditions = [];
    
    if (filter?.companyId) {
      conditions.push(eq(dataImports.companyId, filter.companyId));
    }
    
    if (filter?.dataType) {
      conditions.push(eq(dataImports.dataType, filter.dataType));
    }
    
    const baseQuery = db.select().from(dataImports);
    
    let query = conditions.length > 0 
      ? baseQuery.where(conditions.length === 1 ? conditions[0] : and(...conditions))
      : baseQuery;
    
    query = query.orderBy(desc(dataImports.createdAt));
    
    if (filter?.limit) {
      query = query.limit(filter.limit);
    }
    
    return await query;
  }

  async getDataImport(id: string): Promise<DataImport | undefined> {
    const [importData] = await db.select().from(dataImports).where(eq(dataImports.id, id));
    return importData;
  }

  async createDataImport(importData: InsertDataImport): Promise<DataImport> {
    const [created] = await db.insert(dataImports).values(importData).returning();
    return created;
  }

  async updateDataImport(id: string, importData: Partial<DataImport>): Promise<DataImport | undefined> {
    const [updated] = await db
      .update(dataImports)
      .set(importData)
      .where(eq(dataImports.id, id))
      .returning();
    return updated;
  }

  // Analytics methods
  async getInventoryAnalytics(companyId: string): Promise<any> {
    const productsList = await this.getProducts(companyId);
    const totalProducts = productsList.length;
    const totalStockValue = productsList.reduce((sum, product) => sum + parseFloat(product.price) * product.stock, 0);
    const lowStockProducts = await this.getLowStockProducts(companyId);
    const outOfStockProducts = await this.getOutOfStockProducts(companyId);
    
    return {
      totalProducts,
      totalStockValue,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
      averageStockValue: totalProducts > 0 ? totalStockValue / totalProducts : 0
    };
  }

  async calculateABCClassification(companyId: string): Promise<void> {
    const productsList = await this.getProducts(companyId);
    
    // Calculate revenue for each product
    const productRevenues = productsList.map(product => ({
      id: product.id,
      revenue: parseFloat(product.price) * product.stock
    }));
    
    // Sort by revenue
    productRevenues.sort((a, b) => b.revenue - a.revenue);
    
    const totalRevenue = productRevenues.reduce((sum, p) => sum + p.revenue, 0);
    let cumulativeRevenue = 0;
    
    // Classify products
    for (const product of productRevenues) {
      cumulativeRevenue += product.revenue;
      const percentage = (cumulativeRevenue / totalRevenue) * 100;
      
      let classification = 'C';
      if (percentage <= 80) classification = 'A';
      else if (percentage <= 95) classification = 'B';
      
      await this.updateProduct(product.id, { abcClassification: classification }, companyId);
    }
  }

  async generateStockAlerts(companyId: string): Promise<void> {
    const productsList = await this.getProducts(companyId);
    
    for (const product of productsList) {
      const alerts = [];
      
      if (product.stock <= 0) {
        alerts.push({
          companyId,
          productId: product.id,
          alertType: 'out_of_stock',
          priority: 'critical',
          message: `${product.name} está agotado`,
          threshold: 0,
          currentValue: product.stock
        });
      } else if (product.stock <= (product.minStock || 0)) {
        alerts.push({
          companyId,
          productId: product.id,
          alertType: 'low_stock',
          priority: 'high',
          message: `${product.name} tiene stock bajo (${product.stock} unidades)`,
          threshold: product.minStock,
          currentValue: product.stock
        });
      }
      
      for (const alert of alerts) {
        await this.createStockAlert(alert);
      }
    }
  }
}

// Default demo company ID for initial setup
const DEMO_COMPANY_ID = "demo-company-123";

// Initialize demo data function
export async function initializeDemoData(storage: IStorage) {
  try {
    // Check if demo company already exists
    const existingCompany = await storage.getCompany(DEMO_COMPANY_ID);
    if (existingCompany) {
      console.log('Demo data already initialized');
      return;
    }

    // Create demo company
    const demoCompany = await storage.createCompany({
      name: "Empresa Demo",
      slug: "empresa-demo",
      email: "info@empresa-demo.com",
      phone: "+1 (555) 123-4567",
      address: "123 Main St, Ciudad, Estado 12345",
      industry: "Tecnología",
      size: "medium",
      subscription: "trial"
    });

    // Create demo user
    const demoUser = await storage.createUser({
      companyId: demoCompany.id,
      username: "demo",
      password: "demo123",
      email: "demo@supersetbi.com",
      fullName: "María González",
      role: "company_admin"
    });

    // Create demo categories
    const categoryMap = new Map();
    const categories = [
      { name: "Premium", description: "Productos de alta gama" },
      { name: "Servicios", description: "Servicios profesionales" },
      { name: "Básico", description: "Productos básicos" },
      { name: "Accesorios", description: "Accesorios complementarios" }
    ];

    for (const cat of categories) {
      const category = await storage.createCategory({
        companyId: demoCompany.id,
        ...cat
      });
      categoryMap.set(cat.name, category.id);
    }

    // Create demo products
    const products = [
      { name: "Producto Premium A", categoryName: "Premium", price: "199.99", stock: 45, minStock: 15, description: "Producto de alta calidad" },
      { name: "Servicio Especializado", categoryName: "Servicios", price: "299.99", stock: 100, minStock: 20, description: "Servicio profesional" },
      { name: "Paquete Básico", categoryName: "Básico", price: "89.99", stock: 25, minStock: 10, description: "Paquete de entrada" },
      { name: "Accesorios", categoryName: "Accesorios", price: "49.99", stock: 150, minStock: 30, description: "Accesorios complementarios" },
    ];

    const productIds = [];
    for (const product of products) {
      const created = await storage.createProduct({
        companyId: demoCompany.id,
        name: product.name,
        categoryId: categoryMap.get(product.categoryName),
        price: product.price,
        stock: product.stock,
        minStock: product.minStock,
        description: product.description
      });
      productIds.push(created.id);
    }

    // Create demo sales
    for (let i = 0; i < 50; i++) {
      const productId = productIds[Math.floor(Math.random() * productIds.length)];
      const product = await storage.getProduct(productId, demoCompany.id);
      if (product) {
        const quantity = Math.floor(Math.random() * 5) + 1;
        const totalAmount = (parseFloat(product.price) * quantity).toString();
        
        await storage.createSale({
          companyId: demoCompany.id,
          productId,
          customerName: `Cliente ${i + 1}`,
          customerEmail: `cliente${i + 1}@email.com`,
          quantity,
          unitPrice: product.price,
          totalAmount,
          status: "completed"
        });
      }
    }

    // Create demo collections
    const sales = await storage.getSales(demoCompany.id);
    const selectedSales = sales.slice(0, 30);
    for (const sale of selectedSales) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 60) - 30);
      
      const statuses = ["pending", "paid", "overdue"];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      await storage.createCollection({
        companyId: demoCompany.id,
        saleId: sale.id,
        customerName: sale.customerName,
        amount: sale.totalAmount,
        dueDate,
        status,
        paymentDate: status === "paid" ? new Date() : undefined
      });
    }

    console.log('Demo data initialized successfully');
  } catch (error) {
    console.error('Error initializing demo data:', error);
  }
}

// Create and export storage instance
export const storage = new DatabaseStorage();

// Initialize demo data in the background
initializeDemoData(storage).catch(console.error);
