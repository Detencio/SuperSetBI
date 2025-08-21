export interface DashboardAnalytics {
  kpis: {
    totalRevenue: number;
    inventoryValue: number;
    pendingCollections: number;
    monthlySales: number;
  };
  salesTrend: Array<{
    month: string;
    revenue: number;
  }>;
  inventoryDistribution: Array<{
    name: string;
    value: number;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  collectionStatus: {
    paid: number;
    pending: number;
    overdue: number;
    total: number;
  };
}

export interface Activity {
  id: string;
  type: 'sale' | 'payment' | 'stock' | 'alert';
  message: string;
  amount?: number;
  timestamp: Date;
}

export const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'sale',
    message: 'Nueva venta registrada - Cliente: Empresa ABC S.A.',
    amount: 12450,
    timestamp: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
  },
  {
    id: '2',
    type: 'stock',
    message: 'Stock bajo detectado - Producto Premium A',
    timestamp: new Date(Date.now() - 12 * 60 * 1000) // 12 minutes ago
  },
  {
    id: '3',
    type: 'payment',
    message: 'Pago recibido - Factura #12847',
    amount: 8900,
    timestamp: new Date(Date.now() - 23 * 60 * 1000) // 23 minutes ago
  },
];

export const aiInsights = [
  {
    type: 'opportunity',
    title: 'Oportunidad de Venta',
    message: 'Se proyecta un aumento del 18% en ventas si optimizas el inventario de "Producto Premium A"',
    icon: 'lightbulb'
  },
  {
    type: 'warning',
    title: 'Alerta de Inventario',
    message: 'El stock de "Paquete Básico" estará agotado en 12 días según las tendencias actuales',
    icon: 'exclamation-triangle'
  },
  {
    type: 'prediction',
    title: 'Predicción de Cobranza',
    message: 'Se espera recuperar $89,450 en los próximos 15 días basado en patrones históricos',
    icon: 'chart-line'
  }
];
