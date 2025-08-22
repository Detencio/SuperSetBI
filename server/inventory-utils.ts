import { Product, InventoryMovement, Sale } from "@shared/schema";

export interface InventoryKPIs {
  totalStockValue: number;
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  excessStockProducts: number;
  inventoryTurnover: number;
  serviceLevel: number;
  daysOfInventory: number;
  abcDistribution: {
    A: number;
    B: number;
    C: number;
  };
  liquidityIndex: number;
  inventoryAccuracy: number;
}

export interface ProductAnalytics extends Product {
  rotationRate?: number;
  daysWithoutMovement?: number;
  reorderPoint?: number;
  eoq?: number; // Economic Order Quantity
  safetyStockCalculated?: number;
  stockCoverage?: number;
  profitMargin?: number;
  roi?: number;
  recommendation?: 'REPONER' | 'LIQUIDAR' | 'MANTENER' | 'REDUCIR';
  alertLevel?: 'CRITICO' | 'ALTO' | 'MEDIO' | 'BAJO';
}

export class InventoryAnalytics {
  
  /**
   * Calculate comprehensive inventory KPIs
   */
  static calculateKPIs(
    products: Product[], 
    movements: InventoryMovement[], 
    sales: Sale[]
  ): InventoryKPIs {
    const totalStockValue = products.reduce((sum, p) => 
      sum + (p.stock * parseFloat(p.price)), 0);
    
    const lowStockProducts = products.filter(p => 
      p.stock <= (p.minStock || 10)).length;
    
    const outOfStockProducts = products.filter(p => 
      p.stock === 0).length;
    
    const excessStockProducts = products.filter(p => 
      p.maxStock && p.stock >= p.maxStock * 1.2).length;
    
    // Calculate inventory turnover (simplified)
    const totalCOGS = sales.reduce((sum, s) => 
      sum + parseFloat(s.totalAmount), 0);
    const inventoryTurnover = totalStockValue > 0 ? totalCOGS / totalStockValue : 0;
    
    // Service level (simplified - assuming 95% target)
    const serviceLevel = 95; // This would be calculated from actual order fulfillment data
    
    // Days of inventory
    const daysOfInventory = inventoryTurnover > 0 ? 365 / inventoryTurnover : 0;
    
    // ABC Distribution (simplified)
    const sortedProducts = [...products].sort((a, b) => 
      (b.stock * parseFloat(b.price)) - (a.stock * parseFloat(a.price)));
    
    const totalValue = sortedProducts.reduce((sum, p) => 
      sum + (p.stock * parseFloat(p.price)), 0);
    
    let cumulativeValue = 0;
    let aCount = 0, bCount = 0, cCount = 0;
    
    sortedProducts.forEach(product => {
      cumulativeValue += product.stock * parseFloat(product.price);
      const cumulativePercentage = (cumulativeValue / totalValue) * 100;
      
      if (cumulativePercentage <= 80) {
        aCount++;
      } else if (cumulativePercentage <= 95) {
        bCount++;
      } else {
        cCount++;
      }
    });
    
    return {
      totalStockValue,
      totalProducts: products.length,
      lowStockProducts,
      outOfStockProducts,
      excessStockProducts,
      inventoryTurnover: Math.round(inventoryTurnover * 100) / 100,
      serviceLevel,
      daysOfInventory: Math.round(daysOfInventory),
      abcDistribution: {
        A: Math.round((aCount / products.length) * 100),
        B: Math.round((bCount / products.length) * 100),
        C: Math.round((cCount / products.length) * 100),
      },
      liquidityIndex: inventoryTurnover > 2 ? 85 : inventoryTurnover > 1 ? 65 : 45,
      inventoryAccuracy: 98.5, // This would come from cycle counting data
    };
  }

  /**
   * Calculate reorder point
   */
  static calculateReorderPoint(
    averageDemand: number, 
    leadTimeDays: number, 
    safetyStock: number
  ): number {
    return Math.ceil((averageDemand * leadTimeDays) + safetyStock);
  }

  /**
   * Calculate Economic Order Quantity (EOQ)
   */
  static calculateEOQ(
    annualDemand: number, 
    orderingCost: number, 
    holdingCostPerUnit: number
  ): number {
    if (holdingCostPerUnit <= 0) return 0;
    return Math.ceil(Math.sqrt((2 * annualDemand * orderingCost) / holdingCostPerUnit));
  }

  /**
   * Calculate safety stock
   */
  static calculateSafetyStock(
    serviceLevel: number, 
    leadTimeDays: number, 
    demandVariance: number
  ): number {
    // Z-score for service levels (simplified)
    const zScores: { [key: number]: number } = {
      95: 1.65,
      98: 2.05,
      99: 2.33,
      99.9: 3.09
    };
    
    const zScore = zScores[serviceLevel] || 1.65;
    return Math.ceil(zScore * Math.sqrt(leadTimeDays * demandVariance));
  }

  /**
   * Analyze individual product performance
   */
  static analyzeProduct(
    product: Product, 
    movements: InventoryMovement[], 
    sales: Sale[]
  ): ProductAnalytics {
    const productMovements = movements.filter(m => m.productId === product.id);
    const productSales = sales.filter(s => s.productId === product.id);
    
    // Calculate rotation rate
    const totalSold = productSales.reduce((sum, s) => sum + s.quantity, 0);
    const averageStock = product.stock; // Simplified
    const rotationRate = averageStock > 0 ? totalSold / averageStock : 0;
    
    // Days without movement
    const lastMovement = productMovements
      .sort((a, b) => new Date(b.movementDate).getTime() - new Date(a.movementDate).getTime())[0];
    const daysWithoutMovement = lastMovement 
      ? Math.floor((Date.now() - new Date(lastMovement.movementDate).getTime()) / (1000 * 60 * 60 * 24))
      : 999;
    
    // Calculate margins
    const costPrice = parseFloat(product.costPrice || product.price);
    const sellingPrice = parseFloat(product.price);
    const profitMargin = ((sellingPrice - costPrice) / sellingPrice) * 100;
    
    // Stock coverage
    const averageDailySales = productSales.length > 0 ? totalSold / 30 : 0; // Simplified to 30 days
    const stockCoverage = averageDailySales > 0 ? product.stock / averageDailySales : 999;
    
    // Recommendations
    let recommendation: 'REPONER' | 'LIQUIDAR' | 'MANTENER' | 'REDUCIR' = 'MANTENER';
    let alertLevel: 'CRITICO' | 'ALTO' | 'MEDIO' | 'BAJO' = 'BAJO';
    
    if (product.stock <= (product.minStock || 10) * 0.5) {
      recommendation = 'REPONER';
      alertLevel = 'CRITICO';
    } else if (product.stock <= (product.minStock || 10)) {
      recommendation = 'REPONER';
      alertLevel = 'ALTO';
    } else if (daysWithoutMovement > 180 && profitMargin < 20) {
      recommendation = 'LIQUIDAR';
      alertLevel = 'MEDIO';
    } else if (product.maxStock && product.stock >= product.maxStock * 1.2) {
      recommendation = 'REDUCIR';
      alertLevel = 'MEDIO';
    }

    // Calculate reorder point
    const reorderPoint = this.calculateReorderPoint(
      averageDailySales, 
      7, // Default lead time
      product.safetyStock || 5
    );

    // Calculate EOQ
    const eoq = this.calculateEOQ(
      totalSold * 12, // Annualize
      parseFloat(product.orderingCost || "50"),
      parseFloat(product.storagecost || "5")
    );

    return {
      ...product,
      rotationRate: Math.round(rotationRate * 100) / 100,
      daysWithoutMovement,
      reorderPoint,
      eoq,
      safetyStockCalculated: this.calculateSafetyStock(95, 7, 2),
      stockCoverage: Math.round(stockCoverage),
      profitMargin: Math.round(profitMargin * 100) / 100,
      roi: Math.round((profitMargin * rotationRate) * 100) / 100,
      recommendation,
      alertLevel,
    };
  }

  /**
   * Generate automatic alerts
   */
  static generateAlerts(products: Product[]): Array<{
    productId: string;
    productName: string;
    alertType: string;
    priority: string;
    message: string;
    threshold?: number;
    currentValue?: number;
  }> {
    const alerts = [];

    for (const product of products) {
      // Critical stock alert
      if (product.stock <= (product.minStock || 10) * 0.5) {
        alerts.push({
          productId: product.id,
          productName: product.name,
          alertType: 'low_stock',
          priority: 'critical',
          message: `Stock crítico: Solo ${product.stock} unidades disponibles`,
          threshold: (product.minStock || 10) * 0.5,
          currentValue: product.stock,
        });
      }
      
      // Low stock alert
      else if (product.stock <= (product.minStock || 10)) {
        alerts.push({
          productId: product.id,
          productName: product.name,
          alertType: 'low_stock',
          priority: 'high',
          message: `Stock bajo: ${product.stock} unidades (mínimo: ${product.minStock})`,
          threshold: product.minStock || 10,
          currentValue: product.stock,
        });
      }
      
      // Out of stock alert
      if (product.stock === 0) {
        alerts.push({
          productId: product.id,
          productName: product.name,
          alertType: 'out_of_stock',
          priority: 'critical',
          message: 'Producto agotado - requiere reposición inmediata',
          threshold: 0,
          currentValue: 0,
        });
      }
      
      // Excess stock alert
      if (product.maxStock && product.stock >= product.maxStock * 1.2) {
        alerts.push({
          productId: product.id,
          productName: product.name,
          alertType: 'excess_stock',
          priority: 'medium',
          message: `Exceso de stock: ${product.stock} unidades (máximo recomendado: ${product.maxStock})`,
          threshold: product.maxStock * 1.2,
          currentValue: product.stock,
        });
      }
      
      // Expiration alert (if expiration date exists)
      if (product.expirationDate) {
        const daysToExpiry = Math.floor(
          (new Date(product.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        
        if (daysToExpiry <= 30 && daysToExpiry > 0) {
          alerts.push({
            productId: product.id,
            productName: product.name,
            alertType: 'expiring',
            priority: 'high',
            message: `Producto expira en ${daysToExpiry} días`,
            threshold: 30,
            currentValue: daysToExpiry,
          });
        }
      }
    }

    return alerts;
  }
}