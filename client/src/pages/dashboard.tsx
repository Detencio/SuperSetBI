import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/topbar";
import { Badge } from "@/components/ui/badge";
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
import ExportButton from "@/components/ExportButton";
import CurrencySelector from "@/components/CurrencySelector";
import { getInventoryExportConfig, getSalesExportConfig, getCollectionsExportConfig } from "@/lib/export-utils";
import { useCurrency, convertCurrency, formatCurrency } from "@/lib/currency-utils";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentCurrency } = useCurrency();
  
  const { data: analytics, isLoading, refetch } = useQuery({
    queryKey: ['/api/dashboard/analytics'],
    refetchOnWindowFocus: true,
    refetchInterval: typeof document !== 'undefined' && document.visibilityState === 'visible' ? 10000 : false,
    staleTime: 10000,
  });

  // Fetch all data for comprehensive export
  const { data: products } = useQuery({
    queryKey: ['/api/products'],
    refetchOnWindowFocus: true,
    refetchInterval: typeof document !== 'undefined' && document.visibilityState === 'visible' ? 45000 : false,
    staleTime: 45000,
  });
  
  const { data: sales } = useQuery({
    queryKey: ['/api/sales'],
    refetchOnWindowFocus: true,
    refetchInterval: typeof document !== 'undefined' && document.visibilityState === 'visible' ? 45000 : false,
    staleTime: 45000,
  });
  
  const { data: collections } = useQuery({
    queryKey: ['/api/collections'],
    refetchOnWindowFocus: true,
    refetchInterval: typeof document !== 'undefined' && document.visibilityState === 'visible' ? 45000 : false,
    staleTime: 45000,
  });

  // Función para formatear monedas con conversión automática
  const formatDisplayCurrency = (value: number) => {
    if (currentCurrency.code === 'USD') {
      const convertedValue = convertCurrency(value, 'CLP', 'USD');
      return formatCurrency(convertedValue, 'USD', { 
        showSymbol: true, 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
      });
    }
    return formatCurrency(value, 'CLP', { 
      showSymbol: true, 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    });
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
        <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
        <div className="flex-1 flex flex-col overflow-hidden">
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
        <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
        <div className="flex-1 flex flex-col overflow-hidden">
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
      <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title="Dashboard Ejecutivo" 
          subtitle="Resumen integral de tu negocio"
          onRefresh={handleRefresh}
          onMenuClick={handleMenuClick}
        />
        
        {/* Export Actions Bar */}
        <div className="border-b bg-card px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CurrencySelector 
                variant="dropdown"
                size="sm"
              />
              <Badge variant="outline" className="font-normal">
                Dashboard Ejecutivo
              </Badge>
              <Badge variant="secondary" className="font-normal">
                {formatDisplayCurrency(analytics?.kpis?.totalRevenue || 0)} ingresos
              </Badge>
            </div>
            <ExportButton
              data={[]}
              config={{
                title: 'Reporte Ejecutivo Completo',
                subtitle: 'Dashboard integral de negocio',
                filename: `dashboard-ejecutivo-${new Date().toISOString().split('T')[0]}`,
                columns: [],
                data: [],
              }}
              title="Exportar Dashboard"
              variant="outline"
              multiSheetConfigs={[
                ...(products ? [getInventoryExportConfig(products)] : []),
                ...(sales ? [getSalesExportConfig(sales.map((sale: any) => ({
                  ...sale,
                  productName: products?.find((p: any) => p.id === sale.productId)?.name || 'Producto desconocido',
                  date: sale.saleDate,
                  unitPrice: sale.pricePerUnit,
                  total: sale.totalAmount,
                  customer: sale.customerEmail,
                  salesperson: sale.salesperson || 'N/A',
                })))] : []),
                ...(collections ? [getCollectionsExportConfig(collections.map((collection: any) => ({
                  ...collection,
                  customerName: collection.customerName,
                  issueDate: collection.issueDate,
                  dueDate: collection.dueDate,
                  amount: collection.amount,
                  paidAmount: collection.paidAmount,
                  remainingAmount: collection.remainingAmount,
                  overdueDays: collection.overdueDays || 0,
                  invoiceNumber: collection.saleId,
                })))] : [])
              ]}
            />
          </div>
        </div>
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {/* KPI Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8 auto-rows-fr">
            <KPICard
              title="Ingresos Totales"
              value={formatDisplayCurrency(analytics?.kpis?.totalRevenue || 0)}
              change={analytics?.kpis?.totalRevenue ? 0 : 0}
              icon={<DollarSign className="h-6 w-6 text-superset-blue" />}
              iconBgColor="bg-superset-blue"
            />
            <KPICard
              title="Valor de Inventario"
              value={formatDisplayCurrency(analytics?.kpis?.inventoryValue || 0)}
              change={analytics?.kpis?.inventoryValue ? 0 : 0}
              icon={<Package className="h-6 w-6 text-superset-teal" />}
              iconBgColor="bg-superset-teal"
            />
            <KPICard
              title="Cobranza Pendiente"
              value={formatDisplayCurrency(analytics?.kpis?.pendingCollections || 0)}
              change={analytics?.kpis?.pendingCollections ? 0 : 0}
              icon={<CreditCard className="h-6 w-6 text-superset-orange" />}
              iconBgColor="bg-superset-orange"
            />
            <KPICard
              title="Ventas del Mes"
              value={(analytics?.kpis?.monthlySales || 0).toString()}
              change={analytics?.kpis?.monthlySales ? 0 : 0}
              icon={<TrendingUp className="h-6 w-6 text-success" />}
              iconBgColor="bg-success"
            />
          </div>

          {/* Charts and Analytics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-6 lg:mb-8">
            <SalesChart data={analytics?.salesTrend || []} />
            <InventoryChart data={analytics?.inventoryDistribution || []} />
          </div>

          {/* Detailed Analytics and Tables Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-6 lg:mb-8">
            <TopProducts products={analytics?.topProducts || []} />
            <CollectionStatus status={analytics?.collectionStatus || {}} />
            <AIInsights />
          </div>

          {/* Recent Activities and Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <RecentActivities activities={[]} />
            <QuickActions />
          </div>
        </main>
      </div>
    </div>
  );
}
