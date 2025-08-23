import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { registerDataIngestionRoutes } from "./data-ingestion-simple";
import { registerCompanyRoutes } from "./company-routes";
import { 
  generateProducts, 
  generateSales, 
  generateCollections, 
  generateInventoryAlerts 
} from "./mock-data-generator";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard Analytics
  app.get("/api/dashboard/analytics", async (req, res) => {
    try {
      const products = await storage.getProducts();
      const sales = await storage.getSales();
      const collections = await storage.getCollections();

      // Calculate KPIs
      const totalRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0);
      const inventoryValue = products.reduce((sum, product) => sum + (parseFloat(product.price) * product.stock), 0);
      const pendingCollections = collections
        .filter(c => c.status === "pending" || c.status === "overdue")
        .reduce((sum, collection) => sum + parseFloat(collection.amount), 0);
      const monthlySales = sales.filter(sale => {
        const saleDate = new Date(sale.saleDate!);
        const now = new Date();
        return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
      }).length;

      // Sales trend data (last 12 months)
      const salesTrend = Array.from({ length: 12 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (11 - i));
        const monthSales = sales.filter(sale => {
          const saleDate = new Date(sale.saleDate!);
          return saleDate.getMonth() === date.getMonth() && saleDate.getFullYear() === date.getFullYear();
        });
        return {
          month: date.toLocaleDateString('es-ES', { month: 'short' }),
          revenue: monthSales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0)
        };
      });

      // Inventory distribution
      const categoryStats = products.reduce((acc, product) => {
        acc[product.category] = (acc[product.category] || 0) + product.stock;
        return acc;
      }, {} as Record<string, number>);

      // Top products
      const productSales = sales.reduce((acc, sale) => {
        acc[sale.productId] = (acc[sale.productId] || 0) + sale.quantity;
        return acc;
      }, {} as Record<string, number>);

      const topProducts = Object.entries(productSales)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([productId, quantity]) => {
          const product = products.find(p => p.id === productId);
          const revenue = sales
            .filter(s => s.productId === productId)
            .reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0);
          return {
            id: productId,
            name: product?.name || "Producto desconocido",
            quantity,
            revenue
          };
        });

      // Collection status
      const collectionStatus = {
        paid: collections.filter(c => c.status === "paid").length,
        pending: collections.filter(c => c.status === "pending").length,
        overdue: collections.filter(c => c.status === "overdue").length,
        total: collections.length
      };

      res.json({
        kpis: {
          totalRevenue,
          inventoryValue,
          pendingCollections,
          monthlySales
        },
        salesTrend,
        inventoryDistribution: Object.entries(categoryStats).map(([name, value]) => ({ name, value })),
        topProducts,
        collectionStatus
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching analytics data" });
    }
  });

  // Products API
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Error fetching products" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const product = await storage.createProduct(req.body);
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Error creating product" });
    }
  });

  // Sales API
  app.get("/api/sales", async (req, res) => {
    try {
      const sales = await storage.getSales();
      res.json(sales);
    } catch (error) {
      res.status(500).json({ message: "Error fetching sales" });
    }
  });

  app.post("/api/sales", async (req, res) => {
    try {
      const sale = await storage.createSale(req.body);
      res.json(sale);
    } catch (error) {
      res.status(500).json({ message: "Error creating sale" });
    }
  });

  // Collections API
  app.get("/api/collections", async (req, res) => {
    try {
      const collections = await storage.getCollections();
      res.json(collections);
    } catch (error) {
      res.status(500).json({ message: "Error fetching collections" });
    }
  });

  app.patch("/api/collections/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const collection = await storage.updateCollection(id, req.body);
      if (!collection) {
        return res.status(404).json({ message: "Collection not found" });
      }
      res.json(collection);
    } catch (error) {
      res.status(500).json({ message: "Error updating collection" });
    }
  });

  // Advanced Inventory Analytics API
  app.get("/api/inventory/analytics", async (req, res) => {
    try {
      const products = await storage.getProducts();
      const sales = await storage.getSales();
      const movements: any[] = []; // TODO: Implement when movements are ready
      
      // Import the analytics utility at runtime to avoid circular dependencies
      const { InventoryAnalytics } = await import("./inventory-utils");
      const kpis = InventoryAnalytics.calculateKPIs(products, movements, sales);
      
      res.json(kpis);
    } catch (error) {
      res.status(500).json({ message: "Error calculating inventory analytics" });
    }
  });

  app.get("/api/inventory/alerts", async (req, res) => {
    try {
      const products = await storage.getProducts();
      const { InventoryAnalytics } = await import("./inventory-utils");
      const alerts = InventoryAnalytics.generateAlerts(products);
      
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Error generating inventory alerts" });
    }
  });

  app.get("/api/inventory/products-analysis", async (req, res) => {
    try {
      const products = await storage.getProducts();
      const sales = await storage.getSales();
      const movements: any[] = []; // TODO: Implement when movements are ready
      
      const { InventoryAnalytics } = await import("./inventory-utils");
      const analyzedProducts = products.map(product => 
        InventoryAnalytics.analyzeProduct(product, movements, sales)
      );
      
      res.json(analyzedProducts);
    } catch (error) {
      res.status(500).json({ message: "Error analyzing products" });
    }
  });

  // Register data ingestion routes
  registerDataIngestionRoutes(app);

  // Register company management routes
  registerCompanyRoutes(app);

  // Rutas para importación de datos
  app.post("/api/import/products", async (req, res) => {
    try {
      // Temporalmente devolver éxito para pruebas
      res.json({
        success: true,
        imported: 0,
        message: "Funcionalidad de importación de productos estará disponible próximamente"
      });
    } catch (error) {
      console.error("Error importing products:", error);
      res.status(500).json({ success: false, error: "Error importando productos" });
    }
  });

  app.post("/api/import/sales", async (req, res) => {
    try {
      // Temporalmente devolver éxito para pruebas
      res.json({
        success: true,
        imported: 0,
        message: "Funcionalidad de importación de ventas estará disponible próximamente"
      });
    } catch (error) {
      console.error("Error importing sales:", error);
      res.status(500).json({ success: false, error: "Error importando ventas" });
    }
  });

  app.post("/api/import/customers", async (req, res) => {
    try {
      // Temporalmente devolver éxito para pruebas
      res.json({
        success: true,
        imported: 0,
        message: "Funcionalidad de importación de clientes estará disponible próximamente"
      });
    } catch (error) {
      console.error("Error importing customers:", error);
      res.status(500).json({ success: false, error: "Error importando clientes" });
    }
  });

  // Endpoint para generar datos de prueba completos del año
  app.post("/api/generate-test-data", async (req, res) => {
    try {
      console.log("🔄 Generando datos de prueba completos para un año...");
      
      // Limpiar datos existentes
      await storage.clearAllData();
      console.log("✅ Datos existentes limpiados");
      
      // Generar productos (150 productos variados)
      const products = generateProducts(150);
      for (const product of products) {
        await storage.createProduct(product);
      }
      console.log(`✅ Generados ${products.length} productos`);
      
      // Generar ventas del año completo (3000 ventas)
      const sales = generateSales(products, 3000);
      for (const sale of sales) {
        await storage.createSale(sale);
      }
      console.log(`✅ Generadas ${sales.length} ventas`);
      
      // Generar cobranzas basadas en las ventas
      const collections = generateCollections(sales);
      for (const collection of collections) {
        await storage.createCollection(collection);
      }
      console.log(`✅ Generadas ${collections.length} cobranzas`);
      
      // Generar alertas de inventario
      const alerts = generateInventoryAlerts(products);
      console.log(`✅ Generadas ${alerts.length} alertas de inventario`);
      
      const summary = {
        products: products.length,
        sales: sales.length,
        collections: collections.length,
        alerts: alerts.length,
        totalRevenue: sales.reduce((sum, s) => sum + s.totalAmount, 0),
        dateRange: {
          start: '2024-01-01',
          end: '2024-12-31'
        },
        categories: [...new Set(products.map(p => p.category))].length,
        customers: [...new Set(sales.map(s => s.customerEmail))].length
      };
      
      console.log("🎉 Datos de prueba generados exitosamente:", summary);
      
      res.json({
        success: true,
        message: "Datos de prueba generados exitosamente para un año completo",
        summary
      });
      
    } catch (error) {
      console.error("❌ Error generando datos de prueba:", error);
      res.status(500).json({
        success: false,
        error: "Error interno del servidor al generar datos de prueba"
      });
    }
  });

  // Endpoint para obtener estadísticas de los datos actuales
  app.get("/api/data-statistics", async (req, res) => {
    try {
      const products = await storage.getProducts();
      const sales = await storage.getSales();
      const collections = await storage.getCollections();
      
      const stats = {
        products: {
          total: products.length,
          categories: [...new Set(products.map(p => p.category))].length,
          lowStock: products.filter(p => p.currentStock <= p.minStock).length,
          outOfStock: products.filter(p => p.currentStock === 0).length,
          totalValue: products.reduce((sum, p) => sum + (p.currentStock * p.unitCost), 0)
        },
        sales: {
          total: sales.length,
          totalRevenue: sales.reduce((sum, s) => sum + (parseFloat(String(s.totalAmount || 0))), 0),
          customers: [...new Set(sales.map(s => s.customerEmail))].length,
          thisYear: sales.filter(s => new Date(s.saleDate).getFullYear() === 2024).length,
          thisMonth: sales.filter(s => {
            const saleDate = new Date(s.saleDate);
            const now = new Date();
            return saleDate.getMonth() === now.getMonth() && 
                   saleDate.getFullYear() === now.getFullYear();
          }).length
        },
        collections: {
          total: collections.length,
          pending: collections.filter(c => c.status === 'pending').length,
          overdue: collections.filter(c => c.status === 'overdue').length,
          paid: collections.filter(c => c.status === 'paid').length,
          totalAmount: collections.reduce((sum, c) => sum + (parseFloat(String(c.amount || 0))), 0),
          totalPaid: collections.reduce((sum, c) => sum + (parseFloat(String(c.paidAmount || 0))), 0)
        }
      };
      
      res.json(stats);
      
    } catch (error) {
      console.error("Error obteniendo estadísticas:", error);
      res.status(500).json({
        error: "Error interno del servidor"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
