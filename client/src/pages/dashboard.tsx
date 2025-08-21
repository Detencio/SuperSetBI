import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/topbar";
import KPICard from "@/components/dashboard/kpi-card";
import SalesChart from "@/components/dashboard/sales-chart";
import InventoryChart from "@/components/dashboard/inventory-chart";
import TopProducts from "@/components/dashboard/top-products";
import CollectionStatus from "@/components/dashboard/collection-status";
import AIInsights from "@/components/dashboard/ai-insights";
import RecentActivities from "@/components/dashboard/recent-activities";
import QuickActions from "@/components/dashboard/quick-actions";
import { DollarSign, Package, CreditCard, TrendingUp } from "lucide-react";
import { mockActivities } from "@/lib/mock-data";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const { data: analytics, isLoading, refetch } = useQuery({
    queryKey: ['/api/dashboard/analytics'],
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleMenuClick = () => {
    setSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          <TopBar 
            title="Dashboard Ejecutivo" 
            subtitle="Resumen integral de tu negocio"
            onRefresh={handleRefresh}
            onMenuClick={handleMenuClick}
          />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
              {Array(4).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-6 lg:mb-8">
              <Skeleton className="h-96" />
              <Skeleton className="h-96" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex h-screen overflow-hidden">
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          <TopBar 
            title="Dashboard Ejecutivo" 
            subtitle="Resumen integral de tu negocio"
            onRefresh={handleRefresh}
            onMenuClick={handleMenuClick}
          />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <div className="text-center py-12">
              <p className="text-text-secondary">Error al cargar los datos del dashboard</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <TopBar 
          title="Dashboard Ejecutivo" 
          subtitle="Resumen integral de tu negocio"
          onRefresh={handleRefresh}
          onMenuClick={handleMenuClick}
        />
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {/* KPI Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            <KPICard
              title="Ingresos Totales"
              value={formatCurrency(analytics.kpis.totalRevenue)}
              change={12.5}
              icon={<DollarSign className="h-6 w-6 text-superset-blue" />}
              iconBgColor="bg-superset-blue"
            />
            <KPICard
              title="Valor de Inventario"
              value={formatCurrency(analytics.kpis.inventoryValue)}
              change={-3.2}
              icon={<Package className="h-6 w-6 text-superset-teal" />}
              iconBgColor="bg-superset-teal"
            />
            <KPICard
              title="Cobranza Pendiente"
              value={formatCurrency(analytics.kpis.pendingCollections)}
              change={8.1}
              icon={<CreditCard className="h-6 w-6 text-superset-orange" />}
              iconBgColor="bg-superset-orange"
            />
            <KPICard
              title="Ventas del Mes"
              value={analytics.kpis.monthlySales.toString()}
              change={15.3}
              icon={<TrendingUp className="h-6 w-6 text-success" />}
              iconBgColor="bg-success"
            />
          </div>

          {/* Charts and Analytics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-6 lg:mb-8">
            <SalesChart data={analytics.salesTrend} />
            <InventoryChart data={analytics.inventoryDistribution} />
          </div>

          {/* Detailed Analytics and Tables Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-6 lg:mb-8">
            <TopProducts products={analytics.topProducts} />
            <CollectionStatus status={analytics.collectionStatus} />
            <AIInsights />
          </div>

          {/* Recent Activities and Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <RecentActivities activities={mockActivities} />
            <QuickActions />
          </div>
        </main>
      </div>
    </div>
  );
}
