import { 
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
  type DataImport, type InsertDataImport
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Dashboards
  getDashboards(userId: string): Promise<Dashboard[]>;
  getDashboard(id: string): Promise<Dashboard | undefined>;
  createDashboard(dashboard: InsertDashboard): Promise<Dashboard>;
  updateDashboard(id: string, dashboard: Partial<Dashboard>): Promise<Dashboard | undefined>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<Category>): Promise<Category | undefined>;
  
  // Suppliers
  getSuppliers(): Promise<Supplier[]>;
  getSupplier(id: string): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: string, supplier: Partial<Supplier>): Promise<Supplier | undefined>;
  
  // Warehouses
  getWarehouses(): Promise<Warehouse[]>;
  getWarehouse(id: string): Promise<Warehouse | undefined>;
  createWarehouse(warehouse: InsertWarehouse): Promise<Warehouse>;
  updateWarehouse(id: string, warehouse: Partial<Warehouse>): Promise<Warehouse | undefined>;
  
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<Product>): Promise<Product | undefined>;
  getProductsByCategory(categoryId: string): Promise<Product[]>;
  getProductsByWarehouse(warehouseId: string): Promise<Product[]>;
  getProductsBySupplier(supplierId: string): Promise<Product[]>;
  getLowStockProducts(): Promise<Product[]>;
  getOutOfStockProducts(): Promise<Product[]>;
  getExcessStockProducts(): Promise<Product[]>;
  
  // Inventory Movements
  getInventoryMovements(): Promise<InventoryMovement[]>;
  getInventoryMovement(id: string): Promise<InventoryMovement | undefined>;
  createInventoryMovement(movement: InsertInventoryMovement): Promise<InventoryMovement>;
  getMovementsByProduct(productId: string): Promise<InventoryMovement[]>;
  getMovementsByDateRange(startDate: Date, endDate: Date): Promise<InventoryMovement[]>;
  
  // Stock Alerts
  getStockAlerts(): Promise<StockAlert[]>;
  getStockAlert(id: string): Promise<StockAlert | undefined>;
  createStockAlert(alert: InsertStockAlert): Promise<StockAlert>;
  updateStockAlert(id: string, alert: Partial<StockAlert>): Promise<StockAlert | undefined>;
  getActiveAlerts(): Promise<StockAlert[]>;
  getAlertsByProduct(productId: string): Promise<StockAlert[]>;
  
  // Sales
  getSales(): Promise<Sale[]>;
  getSale(id: string): Promise<Sale | undefined>;
  createSale(sale: InsertSale): Promise<Sale>;
  getSalesByDateRange(startDate: Date, endDate: Date): Promise<Sale[]>;
  
  // Collections
  getCollections(): Promise<Collection[]>;
  getCollection(id: string): Promise<Collection | undefined>;
  createCollection(collection: InsertCollection): Promise<Collection>;
  updateCollection(id: string, collection: Partial<Collection>): Promise<Collection | undefined>;
  getCollectionsByStatus(status: string): Promise<Collection[]>;

  // Enhanced entities for data ingestion
  // Customers
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, customer: Partial<Customer>): Promise<Customer | undefined>;

  // Salespeople
  getSalespeople(): Promise<Salesperson[]>;
  getSalesperson(id: string): Promise<Salesperson | undefined>;
  createSalesperson(salesperson: InsertSalesperson): Promise<Salesperson>;
  updateSalesperson(id: string, salesperson: Partial<Salesperson>): Promise<Salesperson | undefined>;

  // Enhanced Sales
  getEnhancedSales(): Promise<EnhancedSale[]>;
  getEnhancedSale(id: string): Promise<EnhancedSale | undefined>;
  createEnhancedSale(sale: InsertEnhancedSale): Promise<EnhancedSale>;
  updateEnhancedSale(id: string, sale: Partial<EnhancedSale>): Promise<EnhancedSale | undefined>;

  // Sale Items
  getSaleItems(): Promise<SaleItem[]>;
  getSaleItem(id: string): Promise<SaleItem | undefined>;
  createSaleItem(item: InsertSaleItem): Promise<SaleItem>;
  updateSaleItem(id: string, item: Partial<SaleItem>): Promise<SaleItem | undefined>;
  getSaleItemsBySale(saleId: string): Promise<SaleItem[]>;

  // Accounts Receivable
  getAccountsReceivable(): Promise<AccountReceivable[]>;
  getAccountReceivable(id: string): Promise<AccountReceivable | undefined>;
  createAccountReceivable(receivable: InsertAccountReceivable): Promise<AccountReceivable>;
  updateAccountReceivable(id: string, receivable: Partial<AccountReceivable>): Promise<AccountReceivable | undefined>;

  // Payments
  getPayments(): Promise<Payment[]>;
  getPayment(id: string): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: string, payment: Partial<Payment>): Promise<Payment | undefined>;

  // Collection Activities
  getCollectionActivities(): Promise<CollectionActivity[]>;
  getCollectionActivity(id: string): Promise<CollectionActivity | undefined>;
  createCollectionActivity(activity: InsertCollectionActivity): Promise<CollectionActivity>;
  updateCollectionActivity(id: string, activity: Partial<CollectionActivity>): Promise<CollectionActivity | undefined>;

  // Data Imports
  getDataImports(filter?: { dataType?: string; limit?: number }): Promise<DataImport[]>;
  getDataImport(id: string): Promise<DataImport | undefined>;
  createDataImport(importData: InsertDataImport): Promise<DataImport>;
  updateDataImport(id: string, importData: Partial<DataImport>): Promise<DataImport | undefined>;
  
  // Analytics methods
  getInventoryAnalytics(): Promise<any>;
  calculateABCClassification(): Promise<void>;
  generateStockAlerts(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private dashboards: Map<string, Dashboard>;
  private categories: Map<string, Category>;
  private suppliers: Map<string, Supplier>;
  private warehouses: Map<string, Warehouse>;
  private products: Map<string, Product>;
  private inventoryMovements: Map<string, InventoryMovement>;
  private stockAlerts: Map<string, StockAlert>;
  private sales: Map<string, Sale>;
  private collections: Map<string, Collection>;
  
  // Enhanced entities for data ingestion
  private customers: Map<string, Customer>;
  private salespeople: Map<string, Salesperson>;
  private enhancedSales: Map<string, EnhancedSale>;
  private saleItems: Map<string, SaleItem>;
  private accountsReceivable: Map<string, AccountReceivable>;
  private payments: Map<string, Payment>;
  private collectionActivities: Map<string, CollectionActivity>;
  private dataImports: Map<string, DataImport>;

  constructor() {
    this.users = new Map();
    this.dashboards = new Map();
    this.categories = new Map();
    this.suppliers = new Map();
    this.warehouses = new Map();
    this.products = new Map();
    this.inventoryMovements = new Map();
    this.stockAlerts = new Map();
    this.sales = new Map();
    this.collections = new Map();
    
    // Enhanced entities
    this.customers = new Map();
    this.salespeople = new Map();
    this.enhancedSales = new Map();
    this.saleItems = new Map();
    this.accountsReceivable = new Map();
    this.payments = new Map();
    this.collectionActivities = new Map();
    this.dataImports = new Map();
    
    // Initialize with demo user and data
    this.initializeDemoData();
  }

  private async initializeDemoData() {
    // Create demo user
    const demoUser = await this.createUser({
      username: "demo",
      password: "demo123",
      email: "demo@supersetbi.com",
      fullName: "María González",
      role: "admin"
    });

    // Create demo products
    const products = [
      { name: "Producto Premium A", category: "Premium", price: "199.99", stock: 45, minStock: 15, description: "Producto de alta calidad" },
      { name: "Servicio Especializado", category: "Servicios", price: "299.99", stock: 100, minStock: 20, description: "Servicio profesional" },
      { name: "Paquete Básico", category: "Básico", price: "89.99", stock: 25, minStock: 10, description: "Paquete de entrada" },
      { name: "Accesorios", category: "Accesorios", price: "49.99", stock: 150, minStock: 30, description: "Accesorios complementarios" },
    ];

    for (const product of products) {
      await this.createProduct(product);
    }

    // Create demo sales
    const productIds = Array.from(this.products.keys());
    for (let i = 0; i < 50; i++) {
      const productId = productIds[Math.floor(Math.random() * productIds.length)];
      const product = this.products.get(productId)!;
      const quantity = Math.floor(Math.random() * 5) + 1;
      const totalAmount = (parseFloat(product.price) * quantity).toString();
      
      await this.createSale({
        productId,
        customerName: `Cliente ${i + 1}`,
        customerEmail: `cliente${i + 1}@email.com`,
        quantity,
        unitPrice: product.price,
        totalAmount,
        status: "completed"
      });
    }

    // Create demo collections
    const salesIds = Array.from(this.sales.keys()).slice(0, 30);
    for (const saleId of salesIds) {
      const sale = this.sales.get(saleId)!;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 60) - 30); // +/- 30 days
      
      const statuses = ["pending", "paid", "overdue"];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      await this.createCollection({
        saleId,
        customerName: sale.customerName,
        amount: sale.totalAmount,
        dueDate,
        status,
        paymentDate: status === "paid" ? new Date() : undefined
      });
    }
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  // Dashboards
  async getDashboards(userId: string): Promise<Dashboard[]> {
    return Array.from(this.dashboards.values()).filter(dashboard => dashboard.userId === userId);
  }

  async getDashboard(id: string): Promise<Dashboard | undefined> {
    return this.dashboards.get(id);
  }

  async createDashboard(insertDashboard: InsertDashboard): Promise<Dashboard> {
    const id = randomUUID();
    const dashboard: Dashboard = {
      ...insertDashboard,
      id,
      createdAt: new Date()
    };
    this.dashboards.set(id, dashboard);
    return dashboard;
  }

  async updateDashboard(id: string, updates: Partial<Dashboard>): Promise<Dashboard | undefined> {
    const dashboard = this.dashboards.get(id);
    if (!dashboard) return undefined;
    
    const updated = { ...dashboard, ...updates };
    this.dashboards.set(id, updated);
    return updated;
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = {
      ...insertProduct,
      id,
      createdAt: new Date()
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updated = { ...product, ...updates };
    this.products.set(id, updated);
    return updated;
  }

  // Sales
  async getSales(): Promise<Sale[]> {
    return Array.from(this.sales.values());
  }

  async getSale(id: string): Promise<Sale | undefined> {
    return this.sales.get(id);
  }

  async createSale(insertSale: InsertSale): Promise<Sale> {
    const id = randomUUID();
    const sale: Sale = {
      ...insertSale,
      id,
      saleDate: new Date(),
      createdAt: new Date()
    };
    this.sales.set(id, sale);
    return sale;
  }

  async getSalesByDateRange(startDate: Date, endDate: Date): Promise<Sale[]> {
    return Array.from(this.sales.values()).filter(sale => {
      const saleDate = new Date(sale.saleDate!);
      return saleDate >= startDate && saleDate <= endDate;
    });
  }

  // Collections
  async getCollections(): Promise<Collection[]> {
    return Array.from(this.collections.values());
  }

  async getCollection(id: string): Promise<Collection | undefined> {
    return this.collections.get(id);
  }

  async createCollection(insertCollection: InsertCollection): Promise<Collection> {
    const id = randomUUID();
    const collection: Collection = {
      ...insertCollection,
      id,
      createdAt: new Date()
    };
    this.collections.set(id, collection);
    return collection;
  }

  async updateCollection(id: string, updates: Partial<Collection>): Promise<Collection | undefined> {
    const collection = this.collections.get(id);
    if (!collection) return undefined;
    
    const updated = { ...collection, ...updates };
    this.collections.set(id, updated);
    return updated;
  }

  async getCollectionsByStatus(status: string): Promise<Collection[]> {
    return Array.from(this.collections.values()).filter(collection => collection.status === status);
  }

  // Enhanced entities for data ingestion - Customers
  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = randomUUID();
    const customer: Customer = {
      ...insertCustomer,
      id,
      createdAt: new Date()
    };
    this.customers.set(id, customer);
    return customer;
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | undefined> {
    const customer = this.customers.get(id);
    if (!customer) return undefined;
    
    const updated = { ...customer, ...updates };
    this.customers.set(id, updated);
    return updated;
  }

  // Salespeople
  async getSalespeople(): Promise<Salesperson[]> {
    return Array.from(this.salespeople.values());
  }

  async getSalesperson(id: string): Promise<Salesperson | undefined> {
    return this.salespeople.get(id);
  }

  async createSalesperson(insertSalesperson: InsertSalesperson): Promise<Salesperson> {
    const id = randomUUID();
    const salesperson: Salesperson = {
      ...insertSalesperson,
      id,
      createdAt: new Date()
    };
    this.salespeople.set(id, salesperson);
    return salesperson;
  }

  async updateSalesperson(id: string, updates: Partial<Salesperson>): Promise<Salesperson | undefined> {
    const salesperson = this.salespeople.get(id);
    if (!salesperson) return undefined;
    
    const updated = { ...salesperson, ...updates };
    this.salespeople.set(id, updated);
    return updated;
  }

  // Enhanced Sales
  async getEnhancedSales(): Promise<EnhancedSale[]> {
    return Array.from(this.enhancedSales.values());
  }

  async getEnhancedSale(id: string): Promise<EnhancedSale | undefined> {
    return this.enhancedSales.get(id);
  }

  async createEnhancedSale(insertSale: InsertEnhancedSale): Promise<EnhancedSale> {
    const id = randomUUID();
    const sale: EnhancedSale = {
      ...insertSale,
      id,
      createdAt: new Date()
    };
    this.enhancedSales.set(id, sale);
    return sale;
  }

  async updateEnhancedSale(id: string, updates: Partial<EnhancedSale>): Promise<EnhancedSale | undefined> {
    const sale = this.enhancedSales.get(id);
    if (!sale) return undefined;
    
    const updated = { ...sale, ...updates };
    this.enhancedSales.set(id, updated);
    return updated;
  }

  // Sale Items
  async getSaleItems(): Promise<SaleItem[]> {
    return Array.from(this.saleItems.values());
  }

  async getSaleItem(id: string): Promise<SaleItem | undefined> {
    return this.saleItems.get(id);
  }

  async createSaleItem(insertItem: InsertSaleItem): Promise<SaleItem> {
    const id = randomUUID();
    const item: SaleItem = {
      ...insertItem,
      id,
      createdAt: new Date()
    };
    this.saleItems.set(id, item);
    return item;
  }

  async updateSaleItem(id: string, updates: Partial<SaleItem>): Promise<SaleItem | undefined> {
    const item = this.saleItems.get(id);
    if (!item) return undefined;
    
    const updated = { ...item, ...updates };
    this.saleItems.set(id, updated);
    return updated;
  }

  async getSaleItemsBySale(saleId: string): Promise<SaleItem[]> {
    return Array.from(this.saleItems.values()).filter(item => item.saleId === saleId);
  }

  // Accounts Receivable
  async getAccountsReceivable(): Promise<AccountReceivable[]> {
    return Array.from(this.accountsReceivable.values());
  }

  async getAccountReceivable(id: string): Promise<AccountReceivable | undefined> {
    return this.accountsReceivable.get(id);
  }

  async createAccountReceivable(insertReceivable: InsertAccountReceivable): Promise<AccountReceivable> {
    const id = randomUUID();
    const receivable: AccountReceivable = {
      ...insertReceivable,
      id,
      createdAt: new Date()
    };
    this.accountsReceivable.set(id, receivable);
    return receivable;
  }

  async updateAccountReceivable(id: string, updates: Partial<AccountReceivable>): Promise<AccountReceivable | undefined> {
    const receivable = this.accountsReceivable.get(id);
    if (!receivable) return undefined;
    
    const updated = { ...receivable, ...updates };
    this.accountsReceivable.set(id, updated);
    return updated;
  }

  // Payments
  async getPayments(): Promise<Payment[]> {
    return Array.from(this.payments.values());
  }

  async getPayment(id: string): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = randomUUID();
    const payment: Payment = {
      ...insertPayment,
      id,
      createdAt: new Date()
    };
    this.payments.set(id, payment);
    return payment;
  }

  async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment | undefined> {
    const payment = this.payments.get(id);
    if (!payment) return undefined;
    
    const updated = { ...payment, ...updates };
    this.payments.set(id, updated);
    return updated;
  }

  // Collection Activities
  async getCollectionActivities(): Promise<CollectionActivity[]> {
    return Array.from(this.collectionActivities.values());
  }

  async getCollectionActivity(id: string): Promise<CollectionActivity | undefined> {
    return this.collectionActivities.get(id);
  }

  async createCollectionActivity(insertActivity: InsertCollectionActivity): Promise<CollectionActivity> {
    const id = randomUUID();
    const activity: CollectionActivity = {
      ...insertActivity,
      id,
      createdAt: new Date()
    };
    this.collectionActivities.set(id, activity);
    return activity;
  }

  async updateCollectionActivity(id: string, updates: Partial<CollectionActivity>): Promise<CollectionActivity | undefined> {
    const activity = this.collectionActivities.get(id);
    if (!activity) return undefined;
    
    const updated = { ...activity, ...updates };
    this.collectionActivities.set(id, updated);
    return updated;
  }

  // Data Imports
  async getDataImports(filter?: { dataType?: string; limit?: number }): Promise<DataImport[]> {
    let imports = Array.from(this.dataImports.values());
    
    if (filter?.dataType) {
      imports = imports.filter(imp => imp.dataType === filter.dataType);
    }
    
    // Sort by creation date (newest first)
    imports.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
    
    if (filter?.limit) {
      imports = imports.slice(0, filter.limit);
    }
    
    return imports;
  }

  async getDataImport(id: string): Promise<DataImport | undefined> {
    return this.dataImports.get(id);
  }

  async createDataImport(insertImport: InsertDataImport): Promise<DataImport> {
    const id = randomUUID();
    const dataImport: DataImport = {
      ...insertImport,
      id,
      createdAt: new Date()
    };
    this.dataImports.set(id, dataImport);
    return dataImport;
  }

  async updateDataImport(id: string, updates: Partial<DataImport>): Promise<DataImport | undefined> {
    const dataImport = this.dataImports.get(id);
    if (!dataImport) return undefined;
    
    const updated = { ...dataImport, ...updates };
    this.dataImports.set(id, updated);
    return updated;
  }

  // Missing methods from the interface - adding placeholder implementations
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const category: Category = {
      ...insertCategory,
      id,
      createdAt: new Date()
    };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;
    
    const updated = { ...category, ...updates };
    this.categories.set(id, updated);
    return updated;
  }

  async getSuppliers(): Promise<Supplier[]> {
    return Array.from(this.suppliers.values());
  }

  async getSupplier(id: string): Promise<Supplier | undefined> {
    return this.suppliers.get(id);
  }

  async createSupplier(insertSupplier: InsertSupplier): Promise<Supplier> {
    const id = randomUUID();
    const supplier: Supplier = {
      ...insertSupplier,
      id,
      createdAt: new Date()
    };
    this.suppliers.set(id, supplier);
    return supplier;
  }

  async updateSupplier(id: string, updates: Partial<Supplier>): Promise<Supplier | undefined> {
    const supplier = this.suppliers.get(id);
    if (!supplier) return undefined;
    
    const updated = { ...supplier, ...updates };
    this.suppliers.set(id, updated);
    return updated;
  }

  async getWarehouses(): Promise<Warehouse[]> {
    return Array.from(this.warehouses.values());
  }

  async getWarehouse(id: string): Promise<Warehouse | undefined> {
    return this.warehouses.get(id);
  }

  async createWarehouse(insertWarehouse: InsertWarehouse): Promise<Warehouse> {
    const id = randomUUID();
    const warehouse: Warehouse = {
      ...insertWarehouse,
      id,
      createdAt: new Date()
    };
    this.warehouses.set(id, warehouse);
    return warehouse;
  }

  async updateWarehouse(id: string, updates: Partial<Warehouse>): Promise<Warehouse | undefined> {
    const warehouse = this.warehouses.get(id);
    if (!warehouse) return undefined;
    
    const updated = { ...warehouse, ...updates };
    this.warehouses.set(id, updated);
    return updated;
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.categoryId === categoryId);
  }

  async getProductsByWarehouse(warehouseId: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.warehouseId === warehouseId);
  }

  async getProductsBySupplier(supplierId: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.supplierId === supplierId);
  }

  async getLowStockProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.stock <= product.minStock!);
  }

  async getOutOfStockProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.stock === 0);
  }

  async getExcessStockProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.stock > product.maxStock!);
  }

  async getInventoryMovements(): Promise<InventoryMovement[]> {
    return Array.from(this.inventoryMovements.values());
  }

  async getInventoryMovement(id: string): Promise<InventoryMovement | undefined> {
    return this.inventoryMovements.get(id);
  }

  async createInventoryMovement(insertMovement: InsertInventoryMovement): Promise<InventoryMovement> {
    const id = randomUUID();
    const movement: InventoryMovement = {
      ...insertMovement,
      id,
      createdAt: new Date()
    };
    this.inventoryMovements.set(id, movement);
    return movement;
  }

  async getMovementsByProduct(productId: string): Promise<InventoryMovement[]> {
    return Array.from(this.inventoryMovements.values()).filter(movement => movement.productId === productId);
  }

  async getMovementsByDateRange(startDate: Date, endDate: Date): Promise<InventoryMovement[]> {
    return Array.from(this.inventoryMovements.values()).filter(movement => {
      const movementDate = new Date(movement.movementDate!);
      return movementDate >= startDate && movementDate <= endDate;
    });
  }

  async getStockAlerts(): Promise<StockAlert[]> {
    return Array.from(this.stockAlerts.values());
  }

  async getStockAlert(id: string): Promise<StockAlert | undefined> {
    return this.stockAlerts.get(id);
  }

  async createStockAlert(insertAlert: InsertStockAlert): Promise<StockAlert> {
    const id = randomUUID();
    const alert: StockAlert = {
      ...insertAlert,
      id,
      createdAt: new Date()
    };
    this.stockAlerts.set(id, alert);
    return alert;
  }

  async updateStockAlert(id: string, updates: Partial<StockAlert>): Promise<StockAlert | undefined> {
    const alert = this.stockAlerts.get(id);
    if (!alert) return undefined;
    
    const updated = { ...alert, ...updates };
    this.stockAlerts.set(id, updated);
    return updated;
  }

  async getActiveAlerts(): Promise<StockAlert[]> {
    return Array.from(this.stockAlerts.values()).filter(alert => !alert.isResolved);
  }

  async getAlertsByProduct(productId: string): Promise<StockAlert[]> {
    return Array.from(this.stockAlerts.values()).filter(alert => alert.productId === productId);
  }

  async getInventoryAnalytics(): Promise<any> {
    // Implementation for inventory analytics
    return {};
  }

  async calculateABCClassification(): Promise<void> {
    // Implementation for ABC classification
  }

  async generateStockAlerts(): Promise<void> {
    // Implementation for generating stock alerts
  }
}

export const storage = new MemStorage();
