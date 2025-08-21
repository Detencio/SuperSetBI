import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

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

  const httpServer = createServer(app);
  return httpServer;
}
