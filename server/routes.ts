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
import { aiService } from "./ai-service";

export async function registerRoutes(app: Express): Promise<Server> {
  // Register data ingestion routes
  registerDataIngestionRoutes(app);
  
  // Dashboard Analytics
  app.get("/api/dashboard/analytics", async (req, res) => {
    try {
      const products = await storage.getProducts('demo-company-123');
      const sales = await storage.getSales('demo-company-123');
      const collections = await storage.getCollections('demo-company-123');

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
        acc[product.categoryId || 'Sin categoría'] = (acc[product.categoryId || 'Sin categoría'] || 0) + product.stock;
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
      const products = await storage.getProducts('demo-company-123');
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

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteProduct(id, 'demo-company-123');
      if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting product" });
    }
  });

  app.delete("/api/products", async (req, res) => {
    try {
      const deletedCount = await storage.deleteAllProducts('demo-company-123');
      res.json({ message: `${deletedCount} products deleted successfully`, count: deletedCount });
    } catch (error) {
      res.status(500).json({ message: "Error deleting products" });
    }
  });

  // Sales API
  app.get("/api/sales", async (req, res) => {
    try {
      const sales = await storage.getSales('demo-company-123');
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

  app.delete("/api/sales/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteSale(id, 'demo-company-123');
      if (!deleted) {
        return res.status(404).json({ message: "Sale not found" });
      }
      res.json({ message: "Sale deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting sale" });
    }
  });

  app.delete("/api/sales", async (req, res) => {
    try {
      const deletedCount = await storage.deleteAllSales('demo-company-123');
      res.json({ message: `${deletedCount} sales deleted successfully`, count: deletedCount });
    } catch (error) {
      res.status(500).json({ message: "Error deleting sales" });
    }
  });

  // Collections API
  app.get("/api/collections", async (req, res) => {
    try {
      const collections = await storage.getCollections('demo-company-123');
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

  app.delete("/api/collections/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteCollection(id, 'demo-company-123');
      if (!deleted) {
        return res.status(404).json({ message: "Collection not found" });
      }
      res.json({ message: "Collection deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting collection" });
    }
  });

  app.delete("/api/collections", async (req, res) => {
    try {
      const deletedCount = await storage.deleteAllCollections('demo-company-123');
      res.json({ message: `${deletedCount} collections deleted successfully`, count: deletedCount });
    } catch (error) {
      res.status(500).json({ message: "Error deleting collections" });
    }
  });

  // Customers API
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers('demo-company-123');
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Error fetching customers" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const customer = await storage.createCustomer(req.body);
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: "Error creating customer" });
    }
  });

  app.delete("/api/customers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteCustomer(id, 'demo-company-123');
      if (!deleted) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json({ message: "Customer deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting customer" });
    }
  });

  app.delete("/api/customers", async (req, res) => {
    try {
      const deletedCount = await storage.deleteAllCustomers('demo-company-123');
      res.json({ message: `${deletedCount} customers deleted successfully`, count: deletedCount });
    } catch (error) {
      res.status(500).json({ message: "Error deleting customers" });
    }
  });

  // Advanced Inventory Analytics API
  app.get("/api/inventory/analytics", async (req, res) => {
    try {
      const products = await storage.getProducts('demo-company-123');
      const sales = await storage.getSales('demo-company-123');
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
      const products = await storage.getProducts('demo-company-123');
      const { InventoryAnalytics } = await import("./inventory-utils");
      const alerts = InventoryAnalytics.generateAlerts(products);
      
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Error generating inventory alerts" });
    }
  });

  app.get("/api/inventory/products-analysis", async (req, res) => {
    try {
      const products = await storage.getProducts('demo-company-123');
      const sales = await storage.getSales('demo-company-123');
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
      const products = await storage.getProducts('demo-company-123');
      const sales = await storage.getSales('demo-company-123');
      const collections = await storage.getCollections('demo-company-123');
      
      const stats = {
        products: {
          total: products.length,
          categories: [...new Set(products.map(p => p.categoryId).filter(Boolean))].length,
          lowStock: products.filter(p => p.stock <= (p.minStock || 0)).length,
          outOfStock: products.filter(p => p.stock === 0).length,
          totalValue: products.reduce((sum, p) => sum + (p.stock * parseFloat(p.costPrice || '0')), 0)
        },
        sales: {
          total: sales.length,
          totalRevenue: sales.reduce((sum, s) => sum + (parseFloat(String(s.totalAmount || 0))), 0),
          customers: [...new Set(sales.map(s => s.customerEmail).filter(Boolean))].length,
          thisYear: sales.filter(s => s.saleDate && new Date(s.saleDate).getFullYear() === 2024).length,
          thisMonth: sales.filter(s => {
            if (!s.saleDate) return false;
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
          totalPaid: collections.filter(c => c.status === 'paid').reduce((sum, c) => sum + (parseFloat(String(c.amount || 0))), 0)
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

  // AI Assistant Endpoints
  app.get("/api/ai/analysis", async (req, res) => {
    try {
      const companyId = 'demo-company-123'; // Por ahora usamos la empresa demo
      const analysis = await aiService.analyzeBusinessData(companyId);
      res.json(analysis);
    } catch (error) {
      console.error("Error generating AI analysis:", error);
      res.status(500).json({ error: "Error generando análisis IA" });
    }
  });

  // Chat Conversations endpoints
  app.get("/api/chat/conversations", async (req, res) => {
    try {
      const companyId = 'demo-company-123';
      const userId = 'user-demo-123';
      
      const conversations = await storage.getChatConversations(companyId, userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error getting conversations:", error);
      res.status(500).json({ error: "Error al obtener las conversaciones" });
    }
  });

  app.get("/api/chat/conversations/:id/messages", async (req, res) => {
    try {
      const { id } = req.params;
      const companyId = 'demo-company-123';
      
      // Verificar que la conversación pertenece a la empresa
      const conversation = await storage.getChatConversation(id, companyId);
      if (!conversation) {
        return res.status(404).json({ error: "Conversación no encontrada" });
      }
      
      const messages = await storage.getChatMessages(id);
      res.json(messages);
    } catch (error) {
      console.error("Error getting messages:", error);
      res.status(500).json({ error: "Error al obtener los mensajes" });
    }
  });

  app.post("/api/chat/conversations", async (req, res) => {
    try {
      const { title } = req.body;
      const companyId = 'demo-company-123';
      const userId = 'user-demo-123';
      
      const conversation = await storage.createChatConversation({
        companyId,
        userId,
        title: title || 'Nueva conversación',
        messageCount: 0
      });
      
      res.json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ error: "Error al crear la conversación" });
    }
  });

  app.delete("/api/chat/conversations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const companyId = 'demo-company-123';
      
      await storage.deleteChatConversation(id, companyId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({ error: "Error al eliminar la conversación" });
    }
  });

  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, conversationId, createNewConversation = false } = req.body;
      const companyId = 'demo-company-123';
      const userId = 'user-demo-123';
      
      if (!message) {
        return res.status(400).json({ error: "Mensaje requerido" });
      }

      let currentConversationId = conversationId;
      
      // Crear nueva conversación si se solicita o no existe una
      if (createNewConversation || !conversationId) {
        const title = message.length > 50 ? message.substring(0, 50) + '...' : message;
        const newConversation = await storage.createChatConversation({
          companyId,
          userId,
          title,
          messageCount: 0
        });
        currentConversationId = newConversation.id;
      }
      
      // Obtener historial de la conversación
      const conversationHistory = conversationId ? await storage.getChatMessages(conversationId) : [];
      
      // Guardar mensaje del usuario
      await storage.createChatMessage({
        conversationId: currentConversationId,
        role: 'user',
        content: message,
        tokenCount: message.split(' ').length // Estimación simple de tokens
      });
      
      // Generar respuesta de la IA
      const response = await aiService.chatWithAssistant(message, companyId, conversationHistory);
      
      // Guardar respuesta del asistente
      await storage.createChatMessage({
        conversationId: currentConversationId,
        role: 'assistant',
        content: response,
        tokenCount: response.split(' ').length // Estimación simple de tokens
      });
      
      res.json({ 
        response, 
        conversationId: currentConversationId,
        messageCount: conversationHistory.length + 2 // +2 por el mensaje del usuario y la respuesta
      });
    } catch (error) {
      console.error("Error in AI chat:", error);
      res.status(500).json({ error: "Error en el chat del asistente IA" });
    }
  });

  app.get("/api/ai/inventory-insights", async (req, res) => {
    try {
      const companyId = 'demo-company-123'; // Por ahora usamos la empresa demo
      const insights = await aiService.generateInventoryRecommendations(companyId);
      res.json(insights);
    } catch (error) {
      console.error("Error generating inventory insights:", error);
      res.status(500).json({ error: "Error generando insights de inventario" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
