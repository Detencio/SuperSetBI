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

export const mockActivities: Activity[] = [];

export const aiInsights = [];
