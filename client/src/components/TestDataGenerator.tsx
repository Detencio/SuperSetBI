import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Database, 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  CreditCard, 
  Users, 
  AlertTriangle,
  Download,
  RefreshCw 
} from "lucide-react";
import { formatCLP } from "@/lib/currency-utils";

export default function TestDataGenerator() {
  const { toast } = useToast();

  // Consultar estadísticas actuales
  const { data: currentStats, isLoading: loadingStats, refetch: refetchStats } = useQuery({
    queryKey: ['/api/data-statistics'],
  });

  // Mutación para generar datos de prueba
  const generateDataMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/generate-test-data', {
        method: 'POST'
      });
    },
    onSuccess: (data) => {
      toast({
        title: "✅ Datos Generados Exitosamente",
        description: `Se generaron ${data.summary.products} productos, ${data.summary.sales} ventas y ${data.summary.collections} cobranzas para todo el año 2024.`,
        variant: "default",
      });
      
      // Actualizar todas las consultas relacionadas
      queryClient.invalidateQueries({ queryKey: ['/api/data-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/analytics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sales'] });
      queryClient.invalidateQueries({ queryKey: ['/api/collections'] });
      
      refetchStats();
    },
    onError: (error) => {
      toast({
        title: "❌ Error al Generar Datos",
        description: "Ocurrió un problema al generar los datos de prueba. Intenta nuevamente.",
        variant: "destructive",
      });
      console.error('Error generating test data:', error);
    }
  });

  const handleGenerateData = () => {
    generateDataMutation.mutate();
  };

  return (
    <div className="grid gap-6">
      {/* Generador de Datos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Generador de Datos de Prueba</CardTitle>
                <CardDescription>
                  Crea un año completo de datos de simulación para pruebas funcionales
                </CardDescription>
              </div>
            </div>
            <Button 
              onClick={handleGenerateData}
              disabled={generateDataMutation.isPending}
              className="min-w-[160px]"
            >
              {generateDataMutation.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Generar Datos
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {generateDataMutation.isPending && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Generando datos de simulación...</span>
                <span>En progreso</span>
              </div>
              <Progress value={65} className="h-2" />
              <p className="text-sm text-muted-foreground">
                Esto puede tomar unos segundos. Se están creando productos, ventas y cobranzas para todo el año 2024.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center space-y-2">
              <Package className="h-8 w-8 text-blue-500 mx-auto" />
              <div className="text-2xl font-bold">150</div>
              <div className="text-sm text-muted-foreground">Productos</div>
            </div>
            <div className="text-center space-y-2">
              <ShoppingCart className="h-8 w-8 text-green-500 mx-auto" />
              <div className="text-2xl font-bold">3,000</div>
              <div className="text-sm text-muted-foreground">Ventas</div>
            </div>
            <div className="text-center space-y-2">
              <CreditCard className="h-8 w-8 text-orange-500 mx-auto" />
              <div className="text-2xl font-bold">2,400</div>
              <div className="text-sm text-muted-foreground">Cobranzas</div>
            </div>
            <div className="text-center space-y-2">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto" />
              <div className="text-2xl font-bold">~30</div>
              <div className="text-sm text-muted-foreground">Alertas</div>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Características de los Datos
            </h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p><strong>Período:</strong> Enero - Diciembre 2024</p>
                <p><strong>Categorías:</strong> 10 categorías diferentes</p>
                <p><strong>Moneda:</strong> Pesos chilenos (CLP)</p>
              </div>
              <div className="space-y-1">
                <p><strong>Clientes:</strong> ~50 clientes únicos</p>
                <p><strong>Vendedores:</strong> 5 vendedores</p>
                <p><strong>Estados:</strong> Datos realistas con variaciones</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas Actuales */}
      {currentStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Estadísticas de Datos Actuales
            </CardTitle>
            <CardDescription>
              Estado actual de la base de datos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Inventario */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                  Inventario
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Productos</span>
                    <Badge variant="secondary">{currentStats.products.total}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Categorías</span>
                    <Badge variant="outline">{currentStats.products.categories}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Stock Bajo</span>
                    <Badge variant="destructive">{currentStats.products.lowStock}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Sin Stock</span>
                    <Badge variant="destructive">{currentStats.products.outOfStock}</Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Valor Total</span>
                    <span className="text-green-600">
                      {formatCLP(currentStats.products.totalValue)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ventas */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                  Ventas
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Ventas</span>
                    <Badge variant="secondary">{currentStats.sales.total}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Clientes</span>
                    <Badge variant="outline">{currentStats.sales.customers}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Este Año</span>
                    <Badge variant="secondary">{currentStats.sales.thisYear}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Este Mes</span>
                    <Badge variant="secondary">{currentStats.sales.thisMonth}</Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Ingresos Totales</span>
                    <span className="text-green-600">
                      {formatCLP(currentStats.sales.totalRevenue)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cobranzas */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                  Cobranzas
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Facturas</span>
                    <Badge variant="secondary">{currentStats.collections.total}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Pendientes</span>
                    <Badge variant="warning">{currentStats.collections.pending}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Vencidas</span>
                    <Badge variant="destructive">{currentStats.collections.overdue}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Pagadas</span>
                    <Badge variant="success">{currentStats.collections.paid}</Badge>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Por Cobrar</span>
                      <span className="text-blue-600">
                        {formatCLP(currentStats.collections.totalAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Ya Cobrado</span>
                      <span className="text-green-600">
                        {formatCLP(currentStats.collections.totalPaid)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}