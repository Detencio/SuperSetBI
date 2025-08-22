import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp, ShoppingCart, DollarSign, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ExportButton from "@/components/ExportButton";
import { getSalesExportConfig } from "@/lib/export-utils";

export default function Sales() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const { data: sales, isLoading, refetch } = useQuery({
    queryKey: ['/api/sales'],
  });

  const { data: products } = useQuery({
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

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(parseFloat(value));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProductName = (productId: string) => {
    if (!products || !Array.isArray(products)) return 'Producto desconocido';
    const product = products.find((p: any) => p.id === productId);
    return product?.name || 'Producto desconocido';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return { label: 'Completada', color: 'bg-success text-white' };
      case 'pending':
        return { label: 'Pendiente', color: 'bg-warning text-white' };
      case 'cancelled':
        return { label: 'Cancelada', color: 'bg-danger text-white' };
      default:
        return { label: 'Desconocido', color: 'bg-gray-500 text-white' };
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar 
            title="Seguimiento de Ventas" 
            subtitle="Análisis completo de ventas y rendimiento"
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

  if (!sales) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar 
            title="Seguimiento de Ventas" 
            subtitle="Análisis completo de ventas y rendimiento"
            onRefresh={handleRefresh}
            onMenuClick={handleMenuClick}
          />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <div className="text-center py-12">
              <p className="text-text-secondary">Error al cargar las ventas</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const totalSales = Array.isArray(sales) ? sales.length : 0;
  const totalRevenue = Array.isArray(sales) ? sales.reduce((sum: number, s: any) => sum + parseFloat(s.totalAmount), 0) : 0;
  const avgSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0;
  const uniqueCustomers = Array.isArray(sales) ? new Set(sales.map((s: any) => s.customerEmail)).size : 0;

  // Get current month sales
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlySales = Array.isArray(sales) ? sales.filter((s: any) => {
    const saleDate = new Date(s.saleDate);
    return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
  }) : [];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title="Seguimiento de Ventas" 
          subtitle="Análisis completo de ventas y rendimiento"
          onRefresh={handleRefresh}
          onMenuClick={handleMenuClick}
        />
        
        {/* Export Actions Bar */}
        <div className="border-b bg-card px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="font-normal">
                {totalSales} ventas
              </Badge>
              <Badge variant="secondary" className="font-normal">
                {formatCurrency(totalRevenue.toString())} facturado
              </Badge>
            </div>
            <ExportButton
              data={Array.isArray(sales) ? sales.map((sale: any) => ({
                ...sale,
                productName: getProductName(sale.productId),
                date: sale.saleDate,
                unitPrice: sale.pricePerUnit,
                total: sale.totalAmount,
                customer: sale.customerEmail,
                salesperson: sale.salesperson || 'N/A',
              })) : []}
              config={getSalesExportConfig(Array.isArray(sales) ? sales.map((sale: any) => ({
                ...sale,
                productName: getProductName(sale.productId),
                date: sale.saleDate,
                unitPrice: sale.pricePerUnit,
                total: sale.totalAmount,
                customer: sale.customerEmail,
                salesperson: sale.salesperson || 'N/A',
              })) : [])}
              title="Exportar Ventas"
              variant="outline"
              showAdvancedOptions={true}
              allowColumnSelection={true}
              allowDateRange={true}
            />
          </div>
        </div>
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm font-medium">Total Ventas</p>
                    <p className="text-3xl font-bold text-text-primary mt-2">{totalSales}</p>
                    <p className="text-sm text-text-secondary">Del mes: {monthlySales.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-superset-blue bg-opacity-10 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="h-6 w-6 text-superset-blue" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm font-medium">Ingresos Totales</p>
                    <p className="text-3xl font-bold text-text-primary mt-2">
                      {formatCurrency(totalRevenue.toString())}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-success bg-opacity-10 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm font-medium">Venta Promedio</p>
                    <p className="text-3xl font-bold text-text-primary mt-2">
                      {formatCurrency(avgSaleValue.toString())}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-superset-teal bg-opacity-10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-superset-teal" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm font-medium">Clientes Únicos</p>
                    <p className="text-3xl font-bold text-text-primary mt-2">{uniqueCustomers}</p>
                  </div>
                  <div className="w-12 h-12 bg-superset-orange bg-opacity-10 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-superset-orange" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sales Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-text-primary">
                  Historial de Ventas
                </CardTitle>
                <Button className="bg-superset-blue hover:bg-blue-600 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Venta
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-4 font-medium text-text-secondary">Cliente</th>
                      <th className="text-left p-4 font-medium text-text-secondary">Producto</th>
                      <th className="text-left p-4 font-medium text-text-secondary">Cantidad</th>
                      <th className="text-left p-4 font-medium text-text-secondary">Precio Unit.</th>
                      <th className="text-left p-4 font-medium text-text-secondary">Total</th>
                      <th className="text-left p-4 font-medium text-text-secondary">Estado</th>
                      <th className="text-left p-4 font-medium text-text-secondary">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((sale: any) => {
                      const status = getStatusBadge(sale.status);
                      
                      return (
                        <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-4">
                            <div>
                              <p className="font-medium text-text-primary">{sale.customerName}</p>
                              {sale.customerEmail && (
                                <p className="text-sm text-text-secondary">{sale.customerEmail}</p>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="font-medium text-text-primary">
                              {getProductName(sale.productId)}
                            </p>
                          </td>
                          <td className="p-4 text-text-primary">
                            {sale.quantity}
                          </td>
                          <td className="p-4 font-medium text-text-primary">
                            {formatCurrency(sale.unitPrice)}
                          </td>
                          <td className="p-4 font-medium text-text-primary">
                            {formatCurrency(sale.totalAmount)}
                          </td>
                          <td className="p-4">
                            <Badge className={status.color}>
                              {status.label}
                            </Badge>
                          </td>
                          <td className="p-4 text-text-secondary">
                            {formatDate(sale.saleDate)}
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
