import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, AlertTriangle, Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Inventory() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const { data: products, isLoading, refetch } = useQuery({
    queryKey: ['/api/products'],
  });

  const handleRefresh = () => {
    refetch();
  };

  const handleMenuClick = () => {
    setSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { label: "Agotado", color: "bg-danger" };
    if (stock <= minStock) return { label: "Stock Bajo", color: "bg-warning" };
    return { label: "En Stock", color: "bg-success" };
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(parseFloat(value));
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
            title="Control de Inventario" 
            subtitle="Gestión completa de productos y stock"
            onRefresh={handleRefresh}
            onMenuClick={handleMenuClick}
          />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
              {Array(4).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
            <Skeleton className="h-96" />
          </main>
        </div>
      </div>
    );
  }

  if (!products) {
    return (
      <div className="flex h-screen overflow-hidden">
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          <TopBar 
            title="Control de Inventario" 
            subtitle="Gestión completa de productos y stock"
            onRefresh={handleRefresh}
            onMenuClick={handleMenuClick}
          />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <div className="text-center py-12">
              <p className="text-text-secondary">Error al cargar los productos</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const totalProducts = products.length;
  const lowStockProducts = products.filter((p: any) => p.stock <= p.minStock).length;
  const outOfStockProducts = products.filter((p: any) => p.stock === 0).length;
  const totalValue = products.reduce((sum: number, p: any) => sum + (parseFloat(p.price) * p.stock), 0);

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <TopBar 
          title="Control de Inventario" 
          subtitle="Gestión completa de productos y stock"
          onRefresh={handleRefresh}
          onMenuClick={handleMenuClick}
        />
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm font-medium">Total Productos</p>
                    <p className="text-3xl font-bold text-text-primary mt-2">{totalProducts}</p>
                  </div>
                  <div className="w-12 h-12 bg-superset-blue bg-opacity-10 rounded-lg flex items-center justify-center">
                    <Package className="h-6 w-6 text-superset-blue" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm font-medium">Valor Total</p>
                    <p className="text-3xl font-bold text-text-primary mt-2">
                      {formatCurrency(totalValue.toString())}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-success bg-opacity-10 rounded-lg flex items-center justify-center">
                    <Package className="h-6 w-6 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm font-medium">Stock Bajo</p>
                    <p className="text-3xl font-bold text-text-primary mt-2">{lowStockProducts}</p>
                  </div>
                  <div className="w-12 h-12 bg-warning bg-opacity-10 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-warning" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm font-medium">Agotados</p>
                    <p className="text-3xl font-bold text-text-primary mt-2">{outOfStockProducts}</p>
                  </div>
                  <div className="w-12 h-12 bg-danger bg-opacity-10 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-danger" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="text-lg font-semibold text-text-primary">
                  Lista de Productos
                </CardTitle>
                <Button className="bg-superset-blue hover:bg-blue-600 text-white w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Nuevo Producto</span>
                  <span className="sm:hidden">Nuevo</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-2 lg:p-4 font-medium text-text-secondary">Producto</th>
                      <th className="text-left p-2 lg:p-4 font-medium text-text-secondary hidden sm:table-cell">Categoría</th>
                      <th className="text-left p-2 lg:p-4 font-medium text-text-secondary">Precio</th>
                      <th className="text-left p-2 lg:p-4 font-medium text-text-secondary">Stock</th>
                      <th className="text-left p-2 lg:p-4 font-medium text-text-secondary">Estado</th>
                      <th className="text-left p-2 lg:p-4 font-medium text-text-secondary hidden lg:table-cell">Valor Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product: any) => {
                      const status = getStockStatus(product.stock, product.minStock);
                      const totalProductValue = parseFloat(product.price) * product.stock;
                      
                      return (
                        <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-2 lg:p-4">
                            <div>
                              <p className="font-medium text-text-primary text-sm lg:text-base">{product.name}</p>
                              {product.description && (
                                <p className="text-xs lg:text-sm text-text-secondary hidden sm:block">{product.description}</p>
                              )}
                              <div className="sm:hidden">
                                <Badge variant="secondary" className="text-xs mt-1">{product.category}</Badge>
                              </div>
                            </div>
                          </td>
                          <td className="p-2 lg:p-4 hidden sm:table-cell">
                            <Badge variant="secondary">{product.category}</Badge>
                          </td>
                          <td className="p-2 lg:p-4 font-medium text-text-primary text-sm lg:text-base">
                            {formatCurrency(product.price)}
                          </td>
                          <td className="p-2 lg:p-4">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-2">
                              <span className="font-medium text-text-primary">{product.stock}</span>
                              <span className="text-xs lg:text-sm text-text-secondary">unidades</span>
                            </div>
                            <p className="text-xs text-text-secondary">Mín: {product.minStock}</p>
                          </td>
                          <td className="p-2 lg:p-4">
                            <Badge 
                              className={`${status.color} text-white text-xs lg:text-sm`}
                            >
                              {status.label}
                            </Badge>
                          </td>
                          <td className="p-2 lg:p-4 font-medium text-text-primary hidden lg:table-cell">
                            {formatCurrency(totalProductValue.toString())}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
