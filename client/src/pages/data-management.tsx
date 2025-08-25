import { useState, useRef } from "react";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/topbar";
import TestDataGenerator from "@/components/TestDataGenerator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Database, 
  FileText, 
  Download, 
  Upload, 
  Settings,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Package,
  ShoppingCart,
  Users
} from "lucide-react";

export default function DataManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { toast } = useToast();
  
  // Referencias para los inputs de archivos
  const productsFileRef = useRef<HTMLInputElement>(null);
  const salesFileRef = useRef<HTMLInputElement>(null);
  const customersFileRef = useRef<HTMLInputElement>(null);

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  const handleMenuClick = () => {
    setSidebarOpen(true);
  };

  // Estados para progreso de importación
  const [importProgress, setImportProgress] = useState<{
    isImporting: boolean;
    percentage: number;
    current: number;
    total: number;
    message: string;
    successful: number;
    failed: number;
  }>({
    isImporting: false,
    percentage: 0,
    current: 0,
    total: 0,
    message: '',
    successful: 0,
    failed: 0
  });

  // Controlador para cancelar la importación
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  // Función para cancelar la importación
  const cancelImport = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    setImportProgress(prev => ({
      ...prev,
      isImporting: false,
      message: 'Importación cancelada por el usuario'
    }));
    
    toast({
      title: "🚫 Importación Cancelada",
      description: "La importación fue cancelada exitosamente.",
      variant: "default",
    });
  };

  // Función para importar con progreso en tiempo real
  const importFileWithProgress = async (file: File, type: string) => {
    // Crear nuevo AbortController
    const controller = new AbortController();
    setAbortController(controller);
    
    setImportProgress({
      isImporting: true,
      percentage: 0,
      current: 0,
      total: 0,
      message: 'Iniciando importación...',
      successful: 0,
      failed: 0
    });

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`/api/import/${type}`, {
        method: 'POST',
        body: formData,
        signal: controller.signal, // Agregar signal para cancelación
      });

      if (!response.ok) {
        throw new Error('Error en la importación');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.type === 'progress') {
                  setImportProgress(prev => ({
                    ...prev,
                    percentage: data.percentage || 0,
                    current: data.current || 0,
                    total: data.total || 0,
                    message: data.message || '',
                    successful: data.successful || 0,
                    failed: data.failed || 0
                  }));
                } else if (data.type === 'complete') {
                  setImportProgress(prev => ({
                    ...prev,
                    isImporting: false,
                    percentage: 100,
                    message: data.message
                  }));
                  setAbortController(null); // Limpiar controlador
                  
                  toast({
                    title: "✅ Importación Exitosa",
                    description: data.message,
                    variant: "default",
                  });
                } else if (data.type === 'error') {
                  setImportProgress(prev => ({ ...prev, isImporting: false }));
                  setAbortController(null); // Limpiar controlador
                  
                  toast({
                    title: "❌ Error en Importación",
                    description: data.error,
                    variant: "destructive",
                  });
                }
              } catch (parseError) {
                console.error('Error parsing progress data:', parseError);
              }
            }
          }
        }
      }
    } catch (error: any) {
      setImportProgress(prev => ({ ...prev, isImporting: false }));
      setAbortController(null); // Limpiar controlador
      
      // Si fue cancelado por el usuario, no mostrar error
      if (error.name === 'AbortError') {
        return; // El mensaje de cancelación ya se mostró en cancelImport()
      }
      
      toast({
        title: "❌ Error en Importación",
        description: "Ocurrió un problema al importar el archivo. Verifica el formato.",
        variant: "destructive",
      });
      console.error('Import error:', error);
    }
  };

  // Manejar carga de archivos
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      toast({
        title: "Formato No Válido",
        description: "Solo se permiten archivos CSV y Excel (.xlsx, .xls)",
        variant: "destructive",
      });
      return;
    }

    // Ejecutar importación con progreso en tiempo real
    await importFileWithProgress(file, type);
    
    // Limpiar input
    event.target.value = '';
  };

  // Descargar plantillas
  const downloadTemplate = (type: string) => {
    const templates = {
      products: {
        filename: 'plantilla_productos.csv',
        headers: ['sku', 'nombre', 'descripcion', 'categoria', 'proveedor', 'precio_costo', 'precio_venta', 'stock_actual', 'stock_minimo', 'stock_maximo', 'punto_reorden', 'dias_entrega', 'ubicacion', 'unidad_medida', 'estado'],
        sample: ['SKU001', 'Producto Ejemplo', 'Descripción del producto', 'Categoría A', 'Proveedor XYZ', '1.500,00', '2.250,00', '100', '20', '500', '30', '7', 'A1-B2', 'unidad', 'active']
      },
      sales: {
        filename: 'plantilla_ventas.csv',
        headers: ['numero_factura', 'cliente_id', 'cliente_nombre', 'fecha_venta', 'fecha_vencimiento', 'subtotal', 'impuestos', 'descuento', 'total', 'estado_pago', 'metodo_pago', 'canal', 'moneda'],
        sample: ['INV-001', 'CUST001', 'Cliente Ejemplo', '2024-01-15', '2024-02-15', '100,00', '19,00', '0,00', '119,00', 'pending', 'credit', 'store', 'CLP']
      },
      customers: {
        filename: 'plantilla_clientes.csv',
        headers: ['cliente_id', 'cliente_nombre', 'factura_id', 'fecha_factura', 'fecha_vencimiento', 'monto_original', 'monto_pendiente', 'moneda', 'estado', 'prioridad', 'agente_cobranza', 'ultimo_contacto'],
        sample: ['CUST001', 'Cliente Ejemplo', 'INV-001', '2024-01-15', '2024-02-15', '1.000,00', '750,00', 'CLP', 'overdue_30', 'high', 'Agent Smith', '2024-01-20']
      }
    };

    const template = templates[type as keyof typeof templates];
    if (!template) return;

    const csvContent = [
      template.headers.join(','),
      template.sample.join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', template.filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Plantilla Descargada",
      description: `Se descargó ${template.filename}`,
      variant: "default",
    });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title="Gestión de Datos" 
          subtitle="Administra datos de prueba y configuración del sistema"
          onMenuClick={handleMenuClick}
        />
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Información del Sistema */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Database className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Base de Datos</p>
                      <p className="text-lg font-semibold">PostgreSQL</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Estado</p>
                      <p className="text-lg font-semibold">Operativo</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                      <Settings className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Ambiente</p>
                      <p className="text-lg font-semibold">Desarrollo</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alertas Importantes */}
            <div className="space-y-4">
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Base de Datos Configurada</AlertTitle>
                <AlertDescription>
                  La aplicación está conectada a PostgreSQL (Neon Database). Todos los datos se almacenan de forma persistente y están disponibles entre sesiones.
                </AlertDescription>
              </Alert>
            </div>

            <Tabs defaultValue="test-data" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="test-data">Datos de Prueba</TabsTrigger>
                <TabsTrigger value="import-export">Importar/Exportar</TabsTrigger>
                <TabsTrigger value="configuration">Configuración</TabsTrigger>
                <TabsTrigger value="migration">Migración BD</TabsTrigger>
              </TabsList>

              {/* Tab: Datos de Prueba */}
              <TabsContent value="test-data">
                <TestDataGenerator />
              </TabsContent>

              {/* Tab: Importar/Exportar */}
              <TabsContent value="import-export">
                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        Importar Datos
                      </CardTitle>
                      <CardDescription>
                        Carga datos desde archivos CSV o Excel
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Button 
                            variant="outline" 
                            className="h-20 w-full flex flex-col items-center gap-2"
                            onClick={() => productsFileRef.current?.click()}
                          >
                            <Package className="h-6 w-6" />
                            <span className="text-sm">Importar Productos</span>
                          </Button>
                          <Input
                            ref={productsFileRef}
                            type="file"
                            accept=".csv,.xlsx,.xls"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, 'products')}
                          />
                        </div>
                        <div>
                          <Button 
                            variant="outline" 
                            className="h-20 w-full flex flex-col items-center gap-2"
                            onClick={() => salesFileRef.current?.click()}
                          >
                            <ShoppingCart className="h-6 w-6" />
                            <span className="text-sm">Importar Ventas</span>
                          </Button>
                          <Input
                            ref={salesFileRef}
                            type="file"
                            accept=".csv,.xlsx,.xls"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, 'sales')}
                          />
                        </div>
                        <div>
                          <Button 
                            variant="outline" 
                            className="h-20 w-full flex flex-col items-center gap-2"
                            onClick={() => customersFileRef.current?.click()}
                          >
                            <Users className="h-6 w-6" />
                            <span className="text-sm">Importar Clientes</span>
                          </Button>
                          <Input
                            ref={customersFileRef}
                            type="file"
                            accept=".csv,.xlsx,.xls"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, 'customers')}
                          />
                        </div>
                      </div>
                      
                      {/* Indicador de Progreso */}
                      {importProgress.isImporting && (
                        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                                  <span className="font-medium text-blue-900 dark:text-blue-100">
                                    Importando datos...
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-mono text-blue-700 dark:text-blue-300">
                                    {importProgress.percentage}%
                                  </span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={cancelImport}
                                    className="h-7 px-3 text-xs border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                                  >
                                    Cancelar
                                  </Button>
                                </div>
                              </div>
                              
                              <Progress value={importProgress.percentage} className="h-2" />
                              
                              <div className="flex justify-between text-sm text-blue-600 dark:text-blue-400">
                                <span>{importProgress.message}</span>
                                <span>
                                  {importProgress.current} / {importProgress.total}
                                </span>
                              </div>
                              
                              {(importProgress.successful > 0 || importProgress.failed > 0) && (
                                <div className="flex gap-2">
                                  {importProgress.successful > 0 && (
                                    <Badge variant="secondary" className="text-green-700 bg-green-100">
                                      ✓ {importProgress.successful} exitosos
                                    </Badge>
                                  )}
                                  {importProgress.failed > 0 && (
                                    <Badge variant="destructive" className="text-red-700 bg-red-100">
                                      ✗ {importProgress.failed} errores
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                      
                      <div className="space-y-3">
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Formatos Soportados</AlertTitle>
                          <AlertDescription>
                            Se aceptan archivos CSV y Excel (.xlsx, .xls). Los archivos deben tener las columnas requeridas.
                          </AlertDescription>
                        </Alert>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <Button variant="ghost" size="sm" onClick={() => downloadTemplate('products')}>
                            <Download className="mr-2 h-4 w-4" />
                            Plantilla Productos
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => downloadTemplate('sales')}>
                            <Download className="mr-2 h-4 w-4" />
                            Plantilla Ventas
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => downloadTemplate('customers')}>
                            <Download className="mr-2 h-4 w-4" />
                            Plantilla Clientes
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Download className="h-5 w-5" />
                        Exportar Datos
                      </CardTitle>
                      <CardDescription>
                        Descarga datos actuales para respaldo o análisis
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button variant="outline" className="h-20 flex flex-col items-center gap-2">
                          <Download className="h-6 w-6" />
                          <span className="text-sm">Exportar Todo</span>
                          <Badge variant="secondary" className="text-xs">CSV/Excel</Badge>
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col items-center gap-2">
                          <Download className="h-6 w-6" />
                          <span className="text-sm">Respaldo Completo</span>
                          <Badge variant="secondary" className="text-xs">JSON</Badge>
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col items-center gap-2">
                          <Download className="h-6 w-6" />
                          <span className="text-sm">Plantillas</span>
                          <Badge variant="secondary" className="text-xs">CSV</Badge>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Tab: Configuración */}
              <TabsContent value="configuration">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Configuración del Sistema
                    </CardTitle>
                    <CardDescription>
                      Ajustes generales y configuración de datos
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-6">
                      
                      {/* Configuración de Moneda */}
                      <div className="space-y-3">
                        <h4 className="font-semibold">Configuración de Moneda</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Moneda Principal</label>
                            <Badge variant="outline">Peso Chileno (CLP)</Badge>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Formato Numérico</label>
                            <Badge variant="outline">Chileno (15.289,08)</Badge>
                          </div>
                        </div>
                      </div>

                      {/* Configuración Regional */}
                      <div className="space-y-3">
                        <h4 className="font-semibold">Configuración Regional</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Idioma</label>
                            <Badge variant="outline">Español (Chile)</Badge>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Zona Horaria</label>
                            <Badge variant="outline">America/Santiago</Badge>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Formato de Fecha</label>
                            <Badge variant="outline">DD/MM/YYYY</Badge>
                          </div>
                        </div>
                      </div>

                      {/* Configuración de Inventario */}
                      <div className="space-y-3">
                        <h4 className="font-semibold">Configuración de Inventario</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Alertas de Stock Bajo</label>
                            <Badge variant="destructive">Habilitado</Badge>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Cálculo ABC Automático</label>
                            <Badge variant="secondary">Habilitado</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab: Migración BD */}
              <TabsContent value="migration">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Migración a PostgreSQL
                    </CardTitle>
                    <CardDescription>
                      Preparación para migrar a base de datos persistente
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Alert>
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertTitle>Migración Completada</AlertTitle>
                      <AlertDescription>
                        La aplicación ha sido migrada exitosamente a PostgreSQL. Todos los datos se almacenan en la base de datos persistente.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                      <h4 className="font-semibold">Pasos para Migración</h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                          <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-semibold">✓</div>
                          <div>
                            <p className="font-medium">Verificar Configuración de BD</p>
                            <p className="text-sm text-muted-foreground">DATABASE_URL configurado correctamente</p>
                          </div>
                          <Badge variant="secondary">Completado</Badge>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                          <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-semibold">✓</div>
                          <div>
                            <p className="font-medium">Ejecutar Migraciones</p>
                            <p className="text-sm text-muted-foreground">Esquema de base de datos creado</p>
                          </div>
                          <Badge variant="secondary">Completado</Badge>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                          <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-semibold">✓</div>
                          <div>
                            <p className="font-medium">Migrar Storage a DatabaseStorage</p>
                            <p className="text-sm text-muted-foreground">DatabaseStorage implementado y funcionando</p>
                          </div>
                          <Badge variant="secondary">Completado</Badge>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                          <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-semibold">✓</div>
                          <div>
                            <p className="font-medium">Sistema Operativo</p>
                            <p className="text-sm text-muted-foreground">PostgreSQL funcionando correctamente</p>
                          </div>
                          <Badge variant="secondary">Completado</Badge>
                        </div>
                      </div>

                      <div className="pt-4">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <p className="font-medium text-green-800">Migración Completada</p>
                          </div>
                          <p className="text-sm text-green-700 mt-1">
                            Tu aplicación ya está funcionando con PostgreSQL. Todos los datos se almacenan de forma persistente.
                          </p>
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