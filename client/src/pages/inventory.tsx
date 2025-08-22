import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/topbar";
import InventoryKPIs from "@/components/inventory/inventory-kpis";
import InventoryAlerts from "@/components/inventory/inventory-alerts";
import InventoryCharts from "@/components/inventory/inventory-charts";
import InventoryRecommendations from "@/components/inventory/inventory-recommendations";
import InventoryExecutiveDashboard from "@/components/inventory/inventory-executive-dashboard";
import EnhancedProductTable from "@/components/inventory/enhanced-product-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, AlertTriangle, Package, Search, Filter, Download, BarChart3, TrendingUp, Target } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ExportButton from "@/components/ExportButton";
import CurrencySelector from "@/components/CurrencySelector";
import { getInventoryExportConfig } from "@/lib/export-utils";
import { useCurrency } from "@/lib/currency-utils";
import AdvancedFilters from "@/components/AdvancedFilters";
import { generateDynamicFilterConfigs, INVENTORY_FILTER_CONFIGS } from "@/components/FilterConfigurations";

export default function Inventory() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentCurrency, formatDisplayCurrency } = useCurrency();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [advancedFilteredProducts, setAdvancedFilteredProducts] = useState<any[]>([]);
  const [timePeriod, setTimePeriod] = useState("30");
  
  const { data: products, isLoading: productsLoading, refetch: refetchProducts } = useQuery({
    queryKey: ['/api/products'],
  });

  const { data: inventoryKPIs, isLoading: kpisLoading, refetch: refetchKPIs } = useQuery({
    queryKey: ['/api/inventory/analytics'],
  });

  const { data: inventoryAlerts, isLoading: alertsLoading, refetch: refetchAlerts } = useQuery({
    queryKey: ['/api/inventory/alerts'],
  });

  // Combine loading states
  const isLoading = productsLoading || kpisLoading || alertsLoading;

  const handleRefresh = () => {
    refetchProducts();
    refetchKPIs();
    refetchAlerts();
  };

  const handleMenuClick = () => {
    setSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };



  // Legacy filters (mantener compatibilidad con la tabla existente)
  const legacyFilteredProducts = Array.isArray(products) ? products.filter((product: any) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    
    let matchesStock = true;
    if (stockFilter === "low") {
      matchesStock = product.stock <= (product.minStock || 10);
    } else if (stockFilter === "out") {
      matchesStock = product.stock === 0;
    } else if (stockFilter === "excess") {
      matchesStock = product.maxStock && product.stock >= product.maxStock * 1.2;
    }
    
    return matchesSearch && matchesCategory && matchesStock;
  }) : [];

  // Usar productos filtrados avanzados si están disponibles, sino usar filtros legacy
  const finalFilteredProducts = advancedFilteredProducts.length > 0 ? advancedFilteredProducts : legacyFilteredProducts;
  
  // Generar configuraciones de filtro dinámicamente
  const filterConfigs = generateDynamicFilterConfigs(products || [], INVENTORY_FILTER_CONFIGS);

  // Get unique categories
  const categories = Array.from(new Set(Array.isArray(products) ? products.map((p: any) => p.category) : []));



  if (productsLoading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar 
            title="Control de Inventario" 
            subtitle="Gestión completa de productos y stock"
            onRefresh={handleRefresh}
            onMenuClick={handleMenuClick}
          />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <InventoryKPIs kpis={null} isLoading={true} />
            <div className="mt-8">
              <Skeleton className="h-96" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!products) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar 
            title="Control de Inventario" 
            subtitle="Gestión completa de productos y stock"
            onRefresh={handleRefresh}
            onMenuClick={handleMenuClick}
          />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <InventoryKPIs kpis={null} isLoading={false} />
            <div className="mt-8 text-center py-12">
              <p className="text-text-secondary">Error al cargar los productos</p>
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
          title="Control de Inventario" 
          subtitle="Gestión profesional de productos y stock"
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
              <Select value={timePeriod} onValueChange={setTimePeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 días</SelectItem>
                  <SelectItem value="30">Últimos 30 días</SelectItem>
                  <SelectItem value="90">Últimos 3 meses</SelectItem>
                  <SelectItem value="180">Últimos 6 meses</SelectItem>
                  <SelectItem value="365">Último año</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="outline" className="font-normal">
                {finalFilteredProducts?.length || 0} productos
              </Badge>
              {searchTerm && (
                <Badge variant="secondary" className="font-normal">
                  Filtrado por: "{searchTerm}"
                </Badge>
              )}
            </div>
            <ExportButton
              data={finalFilteredProducts || []}
              config={getInventoryExportConfig(finalFilteredProducts || [])}
              title="Exportar Inventario"
              variant="outline"
              showAdvancedOptions={true}
              allowColumnSelection={true}
              allowDateRange={false}
            />
          </div>
        </div>
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {/* Advanced KPIs Dashboard */}
          <InventoryKPIs kpis={inventoryKPIs || null} isLoading={kpisLoading} />
          
          {/* Advanced Filters */}
          <div className="mt-6">
            <AdvancedFilters
              data={products || []}
              onFilteredDataChange={setAdvancedFilteredProducts}
              filterConfigs={filterConfigs}
              module="inventory"
              variant="compact"
              showSegments={true}
            />
          </div>
          
          {/* Main Content Tabs */}
          <div className="mt-8">
            <Tabs defaultValue="executive" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 lg:grid-cols-5 max-w-2xl">
                <TabsTrigger value="executive" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <span className="hidden sm:inline">Ejecutivo</span>
                </TabsTrigger>
                <TabsTrigger value="products" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span className="hidden sm:inline">Productos</span>
                </TabsTrigger>
                <TabsTrigger value="alerts" className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="hidden sm:inline">Alertas</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Análisis</span>
                </TabsTrigger>
                <TabsTrigger value="recommendations" className="flex items-center gap-2 hidden lg:flex">
                  <TrendingUp className="h-4 w-4" />
                  <span className="hidden sm:inline">Recomendaciones</span>
                </TabsTrigger>
              </TabsList>

              {/* Executive Dashboard Tab */}
              <TabsContent value="executive" className="space-y-6">
                <InventoryExecutiveDashboard 
                  products={finalFilteredProducts || []}
                  kpis={inventoryKPIs}
                  isLoading={isLoading}
                  timePeriod={timePeriod}
                />
              </TabsContent>

              {/* Products Tab */}
              <TabsContent value="products" className="space-y-6">
                <EnhancedProductTable 
                  products={finalFilteredProducts || []}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  categoryFilter={categoryFilter}
                  onCategoryChange={setCategoryFilter}
                  stockFilter={stockFilter}
                  onStockChange={setStockFilter}
                  isLoading={isLoading}
                />


              </TabsContent>

              {/* Alerts Tab */}
              <TabsContent value="alerts">
                <InventoryAlerts alerts={inventoryAlerts || []} isLoading={alertsLoading} />
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                <InventoryCharts 
                  products={finalFilteredProducts || []}
                  isLoading={isLoading}
                />
              </TabsContent>

              {/* Recommendations Tab */}
              <TabsContent value="recommendations" className="space-y-6">
                <InventoryRecommendations 
                  products={finalFilteredProducts || []}
                  analytics={inventoryKPIs || null}
                  isLoading={isLoading}
                />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
