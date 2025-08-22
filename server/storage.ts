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
  type Collection, type InsertCollection 
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
}

export const storage = new MemStorage();
