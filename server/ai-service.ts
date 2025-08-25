import { GoogleGenAI } from "@google/genai";
import { storage } from "./storage";

// Inicialización perezosa para asegurar que .env esté cargado antes de leer la clave
function getAI(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key.trim().length === 0) return null;
  return new GoogleGenAI({ apiKey: key });
}

export interface AIInsight {
  type: 'opportunity' | 'warning' | 'prediction' | 'recommendation';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'inventory' | 'sales' | 'collections' | 'general';
  confidence: number;
  data?: any;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface BusinessAnalysis {
  summary: string;
  insights: AIInsight[];
  recommendations: string[];
}

export class AIService {
  async analyzeBusinessData(companyId: string): Promise<BusinessAnalysis> {
    try {
      // Obtener datos de la empresa
      const [products, sales, collections] = await Promise.all([
        storage.getProducts(companyId),
        storage.getSales(companyId),
        storage.getCollections(companyId)
      ]);

      // Preparar contexto para el análisis
      const businessContext = {
        totalProducts: products.length,
        totalSales: sales.length,
        totalCollections: collections.length,
        lowStockProducts: products.filter(p => p.stock <= (p.minStock || 0)).length,
        outOfStockProducts: products.filter(p => p.stock === 0).length,
        totalRevenue: sales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0),
        pendingCollections: collections.filter(c => c.status === 'pending' || c.status === 'overdue').length,
        overdueCollections: collections.filter(c => c.status === 'overdue').length
      };

      const prompt = `
Eres un consultor de inteligencia de negocios experto. Analiza los siguientes datos de negocio y proporciona insights valiosos:

DATOS DE NEGOCIO:
- Total de productos: ${businessContext.totalProducts}
- Total de ventas: ${businessContext.totalSales}
- Ingresos totales: $${businessContext.totalRevenue.toFixed(2)}
- Productos con stock bajo: ${businessContext.lowStockProducts}
- Productos agotados: ${businessContext.outOfStockProducts}
- Cobros pendientes: ${businessContext.pendingCollections}
- Cobros vencidos: ${businessContext.overdueCollections}

PRODUCTOS CON PROBLEMAS DE STOCK:
${products.filter(p => p.stock <= (p.minStock || 0)).map(p => 
  `- ${p.name}: ${p.stock} unidades (mínimo: ${p.minStock})`
).join('\n')}

Proporciona un análisis en formato JSON con esta estructura exacta:
{
  "summary": "Resumen ejecutivo del estado del negocio",
  "insights": [
    {
      "type": "opportunity|warning|prediction|recommendation",
      "title": "Título del insight",
      "message": "Descripción detallada",
      "priority": "low|medium|high|critical",
      "category": "inventory|sales|collections|general",
      "confidence": 0.85
    }
  ],
  "recommendations": ["Recomendación 1", "Recomendación 2", "Recomendación 3"]
}

Máximo 5 insights y 5 recomendaciones. Usa datos reales y específicos.
`;

      const ai = getAI();
      if (!ai) {
        return {
          summary: "IA deshabilitada: falta GEMINI_API_KEY en variables de entorno.",
          insights: [],
          recommendations: []
        } as any;
      }
      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              summary: { type: "string" },
              insights: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string" },
                    title: { type: "string" },
                    message: { type: "string" },
                    priority: { type: "string" },
                    category: { type: "string" },
                    confidence: { type: "number" }
                  },
                  required: ["type", "title", "message", "priority", "category", "confidence"]
                }
              },
              recommendations: {
                type: "array",
                items: { type: "string" }
              }
            },
            required: ["summary", "insights", "recommendations"]
          }
        },
        contents: prompt,
      });

      const analysis = JSON.parse(response.text || '{}');
      return analysis;

    } catch (error) {
      console.error('Error analyzing business data:', error);
      return {
        summary: "No se pudo generar el análisis en este momento.",
        insights: [],
        recommendations: []
      };
    }
  }

  async chatWithAssistant(message: string, companyId: string, conversationHistory: ChatMessage[] = []): Promise<string> {
    try {
      // Obtener contexto actual del negocio
      const [products, sales, collections] = await Promise.all([
        storage.getProducts(companyId),
        storage.getSales(companyId),
        storage.getCollections(companyId)
      ]);

      // Preparar contexto de conversación
      const businessContext = `
CONTEXTO DE NEGOCIO ACTUAL:
- Total de productos: ${products.length}
- Total de ventas registradas: ${sales.length}
- Productos con stock bajo: ${products.filter(p => p.stock <= (p.minStock || 0)).length}
- Ingresos totales: $${sales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0).toFixed(2)}
- Cobros pendientes: ${collections.filter(c => c.status === 'pending' || c.status === 'overdue').length}

PRODUCTOS RECIENTES:
${products.slice(0, 5).map(p => `- ${p.name}: ${p.stock} unidades`).join('\n')}

VENTAS RECIENTES:
${sales.slice(-3).map(s => `- $${s.totalAmount} (${s.customerName})`).join('\n')}
`;

      const systemPrompt = `
Eres un asistente de inteligencia de negocios especializado en análisis de datos comerciales. 
Ayudas a empresarios a entender mejor su negocio y tomar decisiones informadas.

INSTRUCCIONES:
- Responde siempre en español
- Usa los datos reales proporcionados
- Sé específico y práctico en tus respuestas
- Proporciona recomendaciones accionables
- Mantén un tono profesional pero amigable
- Si no tienes suficiente información, pide clarificaciones específicas

${businessContext}
`;

      // Construir historial de conversación
      const messages = [
        { role: "system", content: systemPrompt },
        ...conversationHistory.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          content: msg.content
        })),
        { role: "user", content: message }
      ];

      const ai = getAI();
      if (!ai) {
        return "La IA está deshabilitada porque no hay GEMINI_API_KEY configurada.";
      }
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: messages.map(msg => ({
          role: msg.role === 'system' ? 'user' : msg.role,
          parts: [{ text: msg.content }]
        }))
      });

      return response.text || "Lo siento, no pude procesar tu consulta en este momento.";

    } catch (error) {
      console.error('Error in chat assistant:', error);
      return "Lo siento, hubo un error al procesar tu consulta. Por favor, inténtalo de nuevo.";
    }
  }

  async generateInventoryRecommendations(companyId: string): Promise<AIInsight[]> {
    try {
      const products = await storage.getProducts(companyId);
      const sales = await storage.getSales(companyId);

      const insights: AIInsight[] = [];

      // Productos con stock crítico
      const criticalProducts = products.filter(p => p.stock === 0);
      if (criticalProducts.length > 0) {
        insights.push({
          type: 'warning',
          title: 'Productos Agotados',
          message: `${criticalProducts.length} productos están completamente agotados: ${criticalProducts.slice(0, 3).map(p => p.name).join(', ')}${criticalProducts.length > 3 ? '...' : ''}`,
          priority: 'critical',
          category: 'inventory',
          confidence: 1.0,
          data: { products: criticalProducts.map(p => p.id) }
        });
      }

      // Productos con stock bajo
      const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= (p.minStock || 0));
      if (lowStockProducts.length > 0) {
        insights.push({
          type: 'warning',
          title: 'Stock Bajo',
          message: `${lowStockProducts.length} productos tienen stock por debajo del mínimo recomendado`,
          priority: 'high',
          category: 'inventory',
          confidence: 0.9,
          data: { products: lowStockProducts.map(p => p.id) }
        });
      }

      // Productos más vendidos (oportunidades)
      const productSales = sales.reduce((acc, sale) => {
        acc[sale.productId] = (acc[sale.productId] || 0) + sale.quantity;
        return acc;
      }, {} as Record<string, number>);

      const topSellingProducts = Object.entries(productSales)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([productId]) => products.find(p => p.id === productId))
        .filter(Boolean);

      if (topSellingProducts.length > 0) {
        insights.push({
          type: 'opportunity',
          title: 'Productos Estrella',
          message: `Considera aumentar el stock de tus productos más vendidos: ${topSellingProducts.map(p => p!.name).join(', ')}`,
          priority: 'medium',
          category: 'inventory',
          confidence: 0.8,
          data: { products: topSellingProducts.map(p => p!.id) }
        });
      }

      return insights;

    } catch (error) {
      console.error('Error generating inventory recommendations:', error);
      return [];
    }
  }
}

export const aiService = new AIService();