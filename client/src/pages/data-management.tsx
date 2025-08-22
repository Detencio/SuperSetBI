import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/topbar";
import TestDataGenerator from "@/components/TestDataGenerator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Database, 
  FileText, 
  Download, 
  Upload, 
  Settings,
  AlertCircle,
  CheckCircle2,
  RefreshCw
} from "lucide-react";

export default function DataManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  const handleMenuClick = () => {
    setSidebarOpen(true);
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
                      <p className="text-lg font-semibold">En Memoria</p>
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
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Información Importante</AlertTitle>
                <AlertDescription>
                  Esta aplicación utiliza datos en memoria para pruebas. Los datos se resetean cada vez que se reinicia el servidor.
                  Para producción, se debe migrar a la base de datos PostgreSQL configurada.
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
                        <Button variant="outline" className="h-20 flex flex-col items-center gap-2">
                          <FileText className="h-6 w-6" />
                          <span className="text-sm">Importar Productos</span>
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col items-center gap-2">
                          <FileText className="h-6 w-6" />
                          <span className="text-sm">Importar Ventas</span>
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col items-center gap-2">
                          <FileText className="h-6 w-6" />
                          <span className="text-sm">Importar Clientes</span>
                        </Button>
                      </div>
                      
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Formatos Soportados</AlertTitle>
                        <AlertDescription>
                          Se aceptan archivos CSV y Excel (.xlsx). Asegúrate de que los datos sigan el formato requerido.
                        </AlertDescription>
                      </Alert>
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
                            <Badge variant="success">Habilitado</Badge>
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
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Estado de Migración</AlertTitle>
                      <AlertDescription>
                        La aplicación está configurada para PostgreSQL pero actualmente usa almacenamiento en memoria.
                        Sigue los pasos a continuación para migrar a la base de datos persistente.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                      <h4 className="font-semibold">Pasos para Migración</h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-semibold">1</div>
                          <div>
                            <p className="font-medium">Verificar Configuración de BD</p>
                            <p className="text-sm text-muted-foreground">Asegurar que DATABASE_URL esté configurado</p>
                          </div>
                          <Badge variant="success">Listo</Badge>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <div className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-semibold">2</div>
                          <div>
                            <p className="font-medium">Ejecutar Migraciones</p>
                            <p className="text-sm text-muted-foreground">Ejecutar 'npm run db:push' en terminal</p>
                          </div>
                          <Badge variant="outline">Pendiente</Badge>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <div className="w-6 h-6 rounded-full bg-gray-400 text-white text-xs flex items-center justify-center font-semibold">3</div>
                          <div>
                            <p className="font-medium">Migrar Storage a DatabaseStorage</p>
                            <p className="text-sm text-muted-foreground">Cambiar implementación en server/storage.ts</p>
                          </div>
                          <Badge variant="outline">Pendiente</Badge>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <div className="w-6 h-6 rounded-full bg-gray-400 text-white text-xs flex items-center justify-center font-semibold">4</div>
                          <div>
                            <p className="font-medium">Transferir Datos</p>
                            <p className="text-sm text-muted-foreground">Migrar datos existentes a la nueva BD</p>
                          </div>
                          <Badge variant="outline">Pendiente</Badge>
                        </div>
                      </div>

                      <div className="pt-4">
                        <Button className="w-full md:w-auto" disabled>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Iniciar Migración (Próximamente)
                        </Button>
                        <p className="text-sm text-muted-foreground mt-2">
                          La migración automática estará disponible en una próxima actualización.
                        </p>
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