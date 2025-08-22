import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/topbar";
import InventoryKPIs from "@/components/inventory/inventory-kpis";
import InventoryAlerts from "@/components/inventory/inventory-alerts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, AlertTriangle, Package, Search, Filter, Download, BarChart3, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Inventory() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  
  const { data: products, isLoading: productsLoading, refetch: refetchProducts } = useQuery({
    queryKey: ['/api/products'],
  });

  const { data: inventoryKPIs, isLoading: kpisLoading, refetch: refetchKPIs } = useQuery({
    queryKey: ['/api/inventory/analytics'],
  });

  const { data: inventoryAlerts, isLoading: alertsLoading, refetch: refetchAlerts } = useQuery({
    queryKey: ['/api/inventory/alerts'],
  });

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

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { label: "Agotado", color: "bg-danger text-white" };
    if (stock <= minStock * 0.5) return { label: "Crítico", color: "bg-red-100 text-red-800" };
    if (stock <= minStock) return { label: "Stock Bajo", color: "bg-orange-100 text-orange-800" };
    if (stock <= minStock * 1.5) return { label: "Óptimo", color: "bg-green-100 text-green-800" };
    return { label: "Exceso", color: "bg-blue-100 text-blue-800" };
  };

  const getRecommendation = (stock: number, minStock: number, maxStock?: number) => {
    if (stock === 0) return { action: "REPONER", priority: "CRITICO", color: "bg-red-50 border-red-200 text-red-800" };
    if (stock <= minStock * 0.5) return { action: "REPONER", priority: "ALTO", color: "bg-orange-50 border-orange-200 text-orange-800" };
    if (stock <= minStock) return { action: "REPONER", priority: "MEDIO", color: "bg-yellow-50 border-yellow-200 text-yellow-800" };
    if (maxStock && stock >= maxStock * 1.2) return { action: "LIQUIDAR", priority: "MEDIO", color: "bg-purple-50 border-purple-200 text-purple-800" };
    return { action: "MANTENER", priority: "BAJO", color: "bg-green-50 border-green-200 text-green-800" };
  };

  // Filter products
  const filteredProducts = products?.filter((product: any) => {
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
  }) || [];

  // Get unique categories
  const categories = Array.from(new Set(products?.map((p: any) => p.category) || []));

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(parseFloat(value));
  };

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
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {/* Advanced KPIs Dashboard */}
          <InventoryKPIs kpis={inventoryKPIs} isLoading={kpisLoading} />
          
          {/* Main Content Tabs */}
          <div className="mt-8">
            <Tabs defaultValue="products" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-4 max-w-md">
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

              {/* Products Tab */}
              <TabsContent value="products" className="space-y-6">
                {/* Filters and Search */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Buscar por nombre o SKU..."
                          className="pl-10"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-full sm:w-48">
                          <SelectValue placeholder="Categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas las categorías</SelectItem>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={stockFilter} onValueChange={setStockFilter}>
                        <SelectTrigger className="w-full sm:w-48">
                          <SelectValue placeholder="Estado Stock" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los estados</SelectItem>
                          <SelectItem value="low">Stock bajo</SelectItem>
                          <SelectItem value="out">Sin stock</SelectItem>
                          <SelectItem value="excess">Exceso stock</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Exportar
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Advanced Products Table */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-xl font-bold">
                      Lista de Productos ({filteredProducts.length})
                    </CardTitle>
                    <Button className="bg-superset-blue hover:bg-superset-blue/90">
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar Producto
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-semibold text-text-secondary">Producto</th>
                            <th className="text-left py-3 px-4 font-semibold text-text-secondary hidden md:table-cell">Categoría</th>
                            <th className="text-right py-3 px-4 font-semibold text-text-secondary">Precio</th>
                            <th className="text-right py-3 px-4 font-semibold text-text-secondary">Stock</th>
                            <th className="text-center py-3 px-4 font-semibold text-text-secondary">Estado</th>
                            <th className="text-center py-3 px-4 font-semibold text-text-secondary hidden lg:table-cell">Recomendación</th>
                            <th className="text-center py-3 px-4 font-semibold text-text-secondary hidden xl:table-cell">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredProducts.map((product: any) => {
                            const status = getStockStatus(product.stock, product.minStock || 10);
                            const recommendation = getRecommendation(product.stock, product.minStock || 10, product.maxStock);
                            return (
                              <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td className="py-4 px-4">
                                  <div>
                                    <p className="font-semibold text-text-primary">{product.name}</p>
                                    <p className="text-sm text-text-secondary hidden sm:block">{product.description}</p>
                                    {product.sku && (
                                      <p className="text-xs text-gray-400 font-mono">SKU: {product.sku}</p>
                                    )}
                                  </div>
                                </td>
                                <td className="py-4 px-4 text-text-secondary hidden md:table-cell">{product.category}</td>
                                <td className="py-4 px-4 text-right font-semibold text-text-primary">
                                  {formatCurrency(product.price)}
                                </td>
                                <td className="py-4 px-4 text-right">
                                  <div className="text-right">
                                    <p className="font-semibold text-text-primary">{product.stock}</p>
                                    <p className="text-xs text-text-secondary">
                                      Mín: {product.minStock || 10} | Máx: {product.maxStock || 'N/A'}
                                    </p>
                                  </div>
                                </td>
                                <td className="py-4 px-4 text-center">
                                  <Badge className={status.color + " text-xs font-medium"}>
                                    {status.label}
                                  </Badge>
                                </td>
                                <td className="py-4 px-4 text-center hidden lg:table-cell">
                                  <Badge 
                                    variant="outline" 
                                    className={recommendation.color + " text-xs font-medium border"}
                                  >
                                    {recommendation.action}
                                  </Badge>
                                </td>
                                <td className="py-4 px-4 text-center hidden xl:table-cell">
                                  <div className="flex items-center justify-center gap-1">
                                    <Button variant="ghost" size="sm" className="text-superset-blue hover:bg-superset-blue/10 h-8 px-2">
                                      Editar
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-gray-500 hover:bg-gray-100 h-8 px-2">
                                      Ver
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Alerts Tab */}
              <TabsContent value="alerts">
                <InventoryAlerts alerts={inventoryAlerts || []} isLoading={alertsLoading} />
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Análisis ABC</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        Clasificación de productos por valor e impacto en el negocio
                      </p>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Clase A (Alto valor)</span>
                          <span className="text-green-600 font-semibold">
                            {inventoryKPIs?.abcDistribution?.A || 0}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Clase B (Valor medio)</span>
                          <span className="text-yellow-600 font-semibold">
                            {inventoryKPIs?.abcDistribution?.B || 0}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Clase C (Bajo valor)</span>
                          <span className="text-gray-600 font-semibold">
                            {inventoryKPIs?.abcDistribution?.C || 0}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Métricas de Rendimiento</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span>Rotación de Inventario</span>
                          <span className="font-semibold">
                            {inventoryKPIs?.inventoryTurnover || 0}x/año
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Índice de Liquidez</span>
                          <span className="font-semibold">
                            {inventoryKPIs?.liquidityIndex || 0}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Precisión de Inventario</span>
                          <span className="font-semibold">
                            {inventoryKPIs?.inventoryAccuracy || 0}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Recommendations Tab */}
              <TabsContent value="recommendations">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recomendaciones Automáticas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-red-700 mb-3">Productos para REPONER</h4>
                        <div className="space-y-2">
                          {filteredProducts
                            .filter((p: any) => p.stock <= (p.minStock || 10))
                            .slice(0, 5)
                            .map((product: any) => (
                              <div key={product.id} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                                <span className="font-medium text-sm">{product.name}</span>
                                <Badge variant="destructive" className="text-xs">
                                  Stock: {product.stock}
                                </Badge>
                              </div>
                            ))
                          }
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-purple-700 mb-3">Productos para LIQUIDAR</h4>
                        <div className="space-y-2">
                          {filteredProducts
                            .filter((p: any) => p.maxStock && p.stock >= p.maxStock * 1.2)
                            .slice(0, 5)
                            .map((product: any) => (
                              <div key={product.id} className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                                <span className="font-medium text-sm">{product.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  Exceso: {product.stock}
                                </Badge>
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
