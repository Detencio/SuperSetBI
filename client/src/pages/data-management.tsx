import { useState } from "react";
import { DataUploader } from "@/components/DataUploader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/topbar";
import { 
  Database, 
  Package, 
  TrendingUp, 
  CreditCard, 
  Info, 
  FileText,
  Download,
  Upload,
  Shield,
  Clock
} from "lucide-react";

export default function DataManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleMenuClick = () => {
    setSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title="Gestión de Datos" 
          subtitle="Importa y gestiona los datos de tu empresa"
          onMenuClick={handleMenuClick}
        />
        <main className="flex-1 overflow-auto p-6">
          <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Database className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Gestión de Datos</h1>
            <p className="text-muted-foreground">
              Importa y gestiona los datos de tu empresa de forma automatizada
            </p>
          </div>
        </div>

        {/* Information Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Sistema de Importación Automatizada</AlertTitle>
          <AlertDescription>
            Carga masiva de datos mediante archivos CSV, Excel o JSON. 
            Los datos se validan automáticamente y se integran con todos los KPIs y métricas del sistema.
          </AlertDescription>
        </Alert>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Upload className="h-8 w-8 text-blue-500" />
              <div>
                <h3 className="font-semibold">Carga Automática</h3>
                <p className="text-sm text-muted-foreground">CSV, Excel, JSON</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-green-500" />
              <div>
                <h3 className="font-semibold">Validación</h3>
                <p className="text-sm text-muted-foreground">Tiempo real</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-orange-500" />
              <div>
                <h3 className="font-semibold">Procesamiento</h3>
                <p className="text-sm text-muted-foreground">Asíncrono</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-purple-500" />
              <div>
                <h3 className="font-semibold">Plantillas</h3>
                <p className="text-sm text-muted-foreground">Predefinidas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Import Tabs */}
      <Tabs defaultValue="inventory" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Inventario
          </TabsTrigger>
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Ventas
          </TabsTrigger>
          <TabsTrigger value="collections" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Cobranza
          </TabsTrigger>
        </TabsList>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <DataUploader
                dataType="products"
                title="Importar Productos"
                description="Carga masiva de productos, inventario y datos de proveedores"
                className="h-fit"
              />
            </div>
            
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Datos de Inventario</CardTitle>
                  <CardDescription>
                    Campos incluidos en la importación
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Información básica</span>
                      <Badge variant="secondary">Requerido</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground pl-2">
                      SKU, nombre, categoría, proveedor
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Precios y costos</span>
                      <Badge variant="secondary">Requerido</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground pl-2">
                      Precio venta, precio costo
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Stock y ubicación</span>
                      <Badge variant="secondary">Requerido</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground pl-2">
                      Stock actual, mínimo, máximo, punto de reorden
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Datos adicionales</span>
                      <Badge variant="outline">Opcional</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground pl-2">
                      Descripción, ubicación física, unidad de medida
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">KPIs Automáticos</CardTitle>
                  <CardDescription>
                    Métricas calculadas tras la importación
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">✅ ROI por producto</div>
                  <div className="text-sm">✅ Análisis ABC</div>
                  <div className="text-sm">✅ Rotación de inventario</div>
                  <div className="text-sm">✅ Días de inventario</div>
                  <div className="text-sm">✅ Alertas de stock</div>
                  <div className="text-sm">✅ Recomendaciones automáticas</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <DataUploader
                dataType="sales"
                title="Importar Ventas"
                description="Carga masiva de ventas, facturas y transacciones"
                className="h-fit"
              />
            </div>
            
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Datos de Ventas</CardTitle>
                  <CardDescription>
                    Información de transacciones
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Facturación</span>
                      <Badge variant="secondary">Requerido</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground pl-2">
                      Número factura, cliente, vendedor
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Montos</span>
                      <Badge variant="secondary">Requerido</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground pl-2">
                      Subtotal, impuestos, descuentos, total
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Fechas y pagos</span>
                      <Badge variant="secondary">Requerido</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground pl-2">
                      Fecha venta, vencimiento, método pago
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Análisis Automático</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">📈 Crecimiento de ventas</div>
                  <div className="text-sm">💰 Ticket promedio</div>
                  <div className="text-sm">📊 Margen bruto</div>
                  <div className="text-sm">🏪 Ventas por canal</div>
                  <div className="text-sm">🏆 Top productos</div>
                  <div className="text-sm">👤 Performance vendedores</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Collections Tab */}
        <TabsContent value="collections" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <DataUploader
                dataType="collections"
                title="Importar Cuentas por Cobrar"
                description="Carga masiva de cuentas por cobrar y actividades de cobranza"
                className="h-fit"
              />
            </div>
            
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Datos de Cobranza</CardTitle>
                  <CardDescription>
                    Cuentas por cobrar y pagos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Información básica</span>
                      <Badge variant="secondary">Requerido</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground pl-2">
                      Cliente, factura, fechas
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Montos</span>
                      <Badge variant="secondary">Requerido</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground pl-2">
                      Monto original, pendiente, moneda
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Gestión</span>
                      <Badge variant="outline">Opcional</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground pl-2">
                      Agente cobro, prioridad, contactos
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Métricas de Cobranza</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">⏱️ DSO (Days Sales Outstanding)</div>
                  <div className="text-sm">📅 Análisis de aging</div>
                  <div className="text-sm">💯 Tasa de recuperación</div>
                  <div className="text-sm">⚠️ Ratio deuda incobrable</div>
                  <div className="text-sm">💰 Proyección cash flow</div>
                  <div className="text-sm">🎯 Score riesgo cliente</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Documentation Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentación y Ayuda
          </CardTitle>
          <CardDescription>
            Recursos adicionales para la gestión de datos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Formatos de Datos</h4>
              <p className="text-sm text-muted-foreground">
                Especificaciones detalladas de campos, tipos de datos y validaciones para cada módulo.
              </p>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Ver especificaciones
              </Button>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Guías de Importación</h4>
              <p className="text-sm text-muted-foreground">
                Tutoriales paso a paso para preparar y cargar datos desde diferentes sistemas.
              </p>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Ver guías
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
          </div>
        </main>
      </div>
    </div>
  );
}