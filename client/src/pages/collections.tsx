import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ExportButton from "@/components/ExportButton";
import CurrencySelector from "@/components/CurrencySelector";
import { getCollectionsExportConfig } from "@/lib/export-utils";
import { useCurrency, formatCurrency } from "@/lib/currency-utils";

export default function Collections() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentCurrency, formatDisplayCurrency } = useCurrency();
  
  const { data: collections, isLoading, refetch } = useQuery({
    queryKey: ['/api/collections'],
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return { label: 'Pagado', color: 'bg-success text-white' };
      case 'pending':
        return { label: 'Pendiente', color: 'bg-warning text-white' };
      case 'overdue':
        return { label: 'Vencido', color: 'bg-danger text-white' };
      default:
        return { label: 'Desconocido', color: 'bg-gray-500 text-white' };
    }
  };



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX');
  };

  const getDaysOverdue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar 
            title="Gestión de Cobranza" 
            subtitle="Control de pagos y cuentas por cobrar"
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

  if (!collections) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar 
            title="Gestión de Cobranza" 
            subtitle="Control de pagos y cuentas por cobrar"
            onRefresh={handleRefresh}
            onMenuClick={handleMenuClick}
          />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <div className="text-center py-12">
              <p className="text-text-secondary">Error al cargar las cobranzas</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const totalAmount = Array.isArray(collections) ? collections.reduce((sum: number, c: any) => sum + parseFloat(c.amount), 0) : 0;
  const paidAmount = Array.isArray(collections) ? collections
    .filter((c: any) => c.status === 'paid')
    .reduce((sum: number, c: any) => sum + parseFloat(c.amount), 0) : 0;
  const pendingAmount = Array.isArray(collections) ? collections
    .filter((c: any) => c.status === 'pending')
    .reduce((sum: number, c: any) => sum + parseFloat(c.amount), 0) : 0;
  const overdueAmount = Array.isArray(collections) ? collections
    .filter((c: any) => c.status === 'overdue')
    .reduce((sum: number, c: any) => sum + parseFloat(c.amount), 0) : 0;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title="Gestión de Cobranza" 
          subtitle="Control de pagos y cuentas por cobrar"
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
                {Array.isArray(collections) ? collections.length : 0} cuentas
              </Badge>
              <Badge variant="secondary" className="font-normal">
                {formatDisplayCurrency(totalAmount)} por cobrar
              </Badge>
            </div>
            <ExportButton
              data={Array.isArray(collections) ? collections.map((collection: any) => ({
                ...collection,
                customerName: collection.customerName,
                issueDate: collection.issueDate,
                dueDate: collection.dueDate,
                amount: collection.amount,
                paidAmount: collection.paidAmount,
                remainingAmount: collection.remainingAmount,
                overdueDays: collection.overdueDays || 0,
                invoiceNumber: collection.saleId,
              })) : []}
              config={getCollectionsExportConfig(Array.isArray(collections) ? collections.map((collection: any) => ({
                ...collection,
                customerName: collection.customerName,
                issueDate: collection.issueDate,
                dueDate: collection.dueDate,
                amount: collection.amount,
                paidAmount: collection.paidAmount,
                remainingAmount: collection.remainingAmount,
                overdueDays: collection.overdueDays || 0,
                invoiceNumber: collection.saleId,
              })) : [])}
              title="Exportar Cobranza"
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
                    <p className="text-text-secondary text-sm font-medium">Total por Cobrar</p>
                    <p className="text-3xl font-bold text-text-primary mt-2">
                      {formatDisplayCurrency(totalAmount)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-superset-blue bg-opacity-10 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-superset-blue" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm font-medium">Cobrado</p>
                    <p className="text-3xl font-bold text-text-primary mt-2">
                      {formatDisplayCurrency(paidAmount)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-success bg-opacity-10 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm font-medium">Pendiente</p>
                    <p className="text-3xl font-bold text-text-primary mt-2">
                      {formatCurrency(pendingAmount.toString())}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-warning bg-opacity-10 rounded-lg flex items-center justify-center">
                    <Clock className="h-6 w-6 text-warning" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm font-medium">Vencido</p>
                    <p className="text-3xl font-bold text-text-primary mt-2">
                      {formatCurrency(overdueAmount.toString())}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-danger bg-opacity-10 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-danger" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Collections Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-text-primary">
                Cuentas por Cobrar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-4 font-medium text-text-secondary">Cliente</th>
                      <th className="text-left p-4 font-medium text-text-secondary">Monto</th>
                      <th className="text-left p-4 font-medium text-text-secondary">Fecha Vencimiento</th>
                      <th className="text-left p-4 font-medium text-text-secondary">Estado</th>
                      <th className="text-left p-4 font-medium text-text-secondary">Días Vencido</th>
                      <th className="text-left p-4 font-medium text-text-secondary">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(collections) && collections.map((collection: any) => {
                      const status = getStatusBadge(collection.status);
                      const daysOverdue = getDaysOverdue(collection.dueDate);
                      
                      return (
                        <tr key={collection.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-4">
                            <p className="font-medium text-text-primary">{collection.customerName}</p>
                            <p className="text-sm text-text-secondary">ID: {collection.saleId}</p>
                          </td>
                          <td className="p-4 font-medium text-text-primary">
                            {formatCurrency(collection.amount)}
                          </td>
                          <td className="p-4 text-text-primary">
                            {formatDate(collection.dueDate)}
                          </td>
                          <td className="p-4">
                            <Badge className={status.color}>
                              {status.label}
                            </Badge>
                          </td>
                          <td className="p-4">
                            {collection.status === 'overdue' && daysOverdue > 0 ? (
                              <span className="text-danger font-medium">
                                {daysOverdue} días
                              </span>
                            ) : collection.status === 'pending' && daysOverdue > 0 ? (
                              <span className="text-warning font-medium">
                                {daysOverdue} días
                              </span>
                            ) : (
                              <span className="text-text-secondary">-</span>
                            )}
                          </td>
                          <td className="p-4">
                            {collection.status !== 'paid' && (
                              <Button 
                                size="sm" 
                                className="bg-success hover:bg-green-600 text-white"
                              >
                                Marcar Pagado
                              </Button>
                            )}
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
