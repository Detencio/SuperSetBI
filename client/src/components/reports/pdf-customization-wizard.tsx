import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  FileText, 
  Palette, 
  BarChart3, 
  Settings,
  Eye,
  Wand2,
  Sparkles,
  CheckCircle,
  Circle
} from "lucide-react";

export interface PDFCustomizationConfig {
  // Configuración general
  title: string;
  subtitle: string;
  includeDate: boolean;
  includeCompanyLogo: boolean;
  
  // Secciones del reporte
  sections: {
    executiveSummary: boolean;
    kpiMetrics: boolean;
    detailedAnalysis: boolean;
    chartVisualizations: boolean;
    recommendationsSection: boolean;
    alertsSection: boolean;
    abcAnalysis: boolean;
  };
  
  // Configuración de gráficos
  charts: {
    includeCharts: boolean;
    chartTypes: string[];
    chartColorScheme: string;
    chartSize: 'small' | 'medium' | 'large';
  };
  
  // Estilo y diseño
  design: {
    colorTheme: string;
    layout: 'compact' | 'detailed' | 'executive';
    fontFamily: string;
    includeGradients: boolean;
    includeIcons: boolean;
  };
  
  // Filtros de datos
  filters: {
    dateRange: string;
    categories: string[];
    minimumStockLevel: number;
    includeOutOfStock: boolean;
  };
}

interface PDFCustomizationWizardProps {
  onGenerateReport: (config: PDFCustomizationConfig) => void;
  isGenerating?: boolean;
  availableCategories?: string[];
}

const DEFAULT_CONFIG: PDFCustomizationConfig = {
  title: "Reporte Ejecutivo de Inventario",
  subtitle: "Análisis integral y recomendaciones estratégicas",
  includeDate: true,
  includeCompanyLogo: true,
  
  sections: {
    executiveSummary: true,
    kpiMetrics: true,
    detailedAnalysis: true,
    chartVisualizations: true,
    recommendationsSection: true,
    alertsSection: true,
    abcAnalysis: true,
  },
  
  charts: {
    includeCharts: true,
    chartTypes: ['bar', 'pie', 'line'],
    chartColorScheme: 'blue',
    chartSize: 'medium',
  },
  
  design: {
    colorTheme: 'professional',
    layout: 'executive',
    fontFamily: 'modern',
    includeGradients: true,
    includeIcons: true,
  },
  
  filters: {
    dateRange: 'last_30_days',
    categories: [],
    minimumStockLevel: 0,
    includeOutOfStock: true,
  }
};

const WIZARD_STEPS = [
  { 
    id: 'general', 
    title: 'Información General',
    description: 'Configura el título y opciones básicas',
    icon: FileText 
  },
  { 
    id: 'sections', 
    title: 'Secciones del Reporte',
    description: 'Selecciona qué secciones incluir',
    icon: BarChart3 
  },
  { 
    id: 'design', 
    title: 'Diseño y Estilo',
    description: 'Personaliza la apariencia del reporte',
    icon: Palette 
  },
  { 
    id: 'filters', 
    title: 'Filtros de Datos',
    description: 'Configura qué datos incluir',
    icon: Settings 
  },
  { 
    id: 'preview', 
    title: 'Vista Previa',
    description: 'Revisa la configuración antes de generar',
    icon: Eye 
  }
];

export default function PDFCustomizationWizard({ 
  onGenerateReport, 
  isGenerating = false,
  availableCategories = [] 
}: PDFCustomizationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState<PDFCustomizationConfig>(DEFAULT_CONFIG);

  const updateConfig = useCallback((updates: Partial<PDFCustomizationConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const updateNestedConfig = useCallback((section: keyof PDFCustomizationConfig, updates: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: { ...(prev[section] as object), ...updates }
    }));
  }, []);

  const nextStep = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;

  const StepIcon = WIZARD_STEPS[currentStep].icon;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Wand2 className="h-6 w-6 text-white" />
          </motion.div>
          <div>
            <CardTitle className="text-xl font-bold text-gray-900">
              Asistente de Personalización de Reportes
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Crea reportes PDF personalizados con un solo clic
            </p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Paso {currentStep + 1} de {WIZARD_STEPS.length}</span>
            <span>{Math.round(progress)}% completado</span>
          </div>
          <Progress value={progress} className="h-2" />
          
          {/* Step indicators */}
          <div className="flex justify-between mt-4">
            {WIZARD_STEPS.map((step, index) => (
              <motion.div
                key={step.id}
                className={`flex flex-col items-center ${
                  index <= currentStep ? 'text-blue-600' : 'text-gray-400'
                }`}
                whileHover={{ scale: 1.05 }}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  index < currentStep 
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : index === currentStep
                    ? 'border-blue-600 bg-white text-blue-600'
                    : 'border-gray-300 bg-white text-gray-400'
                }`}>
                  {index < currentStep ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                </div>
                <span className="text-xs mt-1 font-medium">{step.title}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-[400px]"
          >
            {/* Step Content */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <StepIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {WIZARD_STEPS[currentStep].title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {WIZARD_STEPS[currentStep].description}
                  </p>
                </div>
              </div>
            </div>

            {/* Step 1: General Information */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título del Reporte</Label>
                    <Input
                      id="title"
                      value={config.title}
                      onChange={(e) => updateConfig({ title: e.target.value })}
                      placeholder="Ej: Reporte Ejecutivo de Inventario"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subtitle">Subtítulo</Label>
                    <Input
                      id="subtitle"
                      value={config.subtitle}
                      onChange={(e) => updateConfig({ subtitle: e.target.value })}
                      placeholder="Ej: Análisis mensual y recomendaciones"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Incluir fecha de generación</Label>
                      <p className="text-sm text-gray-600">Muestra cuándo se generó el reporte</p>
                    </div>
                    <Switch
                      checked={config.includeDate}
                      onCheckedChange={(checked) => updateConfig({ includeDate: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Incluir logo de la empresa</Label>
                      <p className="text-sm text-gray-600">Agrega branding corporativo</p>
                    </div>
                    <Switch
                      checked={config.includeCompanyLogo}
                      onCheckedChange={(checked) => updateConfig({ includeCompanyLogo: checked })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Report Sections */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(config.sections).map(([key, value]) => {
                    const sectionLabels: { [key: string]: { title: string; description: string } } = {
                      executiveSummary: { title: "Resumen Ejecutivo", description: "Visión general de métricas clave" },
                      kpiMetrics: { title: "Métricas KPI", description: "Indicadores de rendimiento detallados" },
                      detailedAnalysis: { title: "Análisis Detallado", description: "Análisis profundo de inventario" },
                      chartVisualizations: { title: "Gráficos", description: "Visualizaciones de datos interactivas" },
                      recommendationsSection: { title: "Recomendaciones", description: "Sugerencias estratégicas" },
                      alertsSection: { title: "Alertas", description: "Productos críticos y alertas" },
                      abcAnalysis: { title: "Análisis ABC", description: "Clasificación por valor e importancia" }
                    };

                    const section = sectionLabels[key];
                    return (
                      <motion.div
                        key={key}
                        className={`p-4 border rounded-lg transition-all duration-200 ${
                          value ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
                        }`}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{section.title}</h4>
                            <p className="text-sm text-gray-600">{section.description}</p>
                          </div>
                          <Switch
                            checked={value}
                            onCheckedChange={(checked) => 
                              updateNestedConfig('sections', { [key]: checked })
                            }
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Design and Style */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <Tabs defaultValue="theme" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="theme">Tema</TabsTrigger>
                    <TabsTrigger value="layout">Layout</TabsTrigger>
                    <TabsTrigger value="charts">Gráficos</TabsTrigger>
                  </TabsList>

                  <TabsContent value="theme" className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { id: 'professional', name: 'Profesional', colors: ['#3b82f6', '#1e40af'] },
                        { id: 'elegant', name: 'Elegante', colors: ['#6b7280', '#374151'] },
                        { id: 'modern', name: 'Moderno', colors: ['#8b5cf6', '#7c3aed'] },
                        { id: 'corporate', name: 'Corporativo', colors: ['#059669', '#047857'] }
                      ].map(theme => (
                        <motion.div
                          key={theme.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            config.design.colorTheme === theme.id 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => updateNestedConfig('design', { colorTheme: theme.id })}
                        >
                          <div className="flex gap-2 mb-2">
                            {theme.colors.map((color, i) => (
                              <div 
                                key={i} 
                                className="w-6 h-6 rounded" 
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium">{theme.name}</span>
                        </motion.div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Incluir gradientes</Label>
                          <p className="text-sm text-gray-600">Agrega efectos visuales modernos</p>
                        </div>
                        <Switch
                          checked={config.design.includeGradients}
                          onCheckedChange={(checked) => 
                            updateNestedConfig('design', { includeGradients: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Incluir iconos</Label>
                          <p className="text-sm text-gray-600">Mejora la legibilidad visual</p>
                        </div>
                        <Switch
                          checked={config.design.includeIcons}
                          onCheckedChange={(checked) => 
                            updateNestedConfig('design', { includeIcons: checked })
                          }
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="layout" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { id: 'compact', name: 'Compacto', description: 'Máxima información en menos páginas' },
                        { id: 'detailed', name: 'Detallado', description: 'Análisis exhaustivo con explicaciones' },
                        { id: 'executive', name: 'Ejecutivo', description: 'Diseño premium para alta dirección' }
                      ].map(layout => (
                        <motion.div
                          key={layout.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            config.design.layout === layout.id 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => updateNestedConfig('design', { layout: layout.id })}
                        >
                          <h4 className="font-medium text-gray-900">{layout.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{layout.description}</p>
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="charts" className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Incluir gráficos</Label>
                          <p className="text-sm text-gray-600">Visualizaciones de datos en el reporte</p>
                        </div>
                        <Switch
                          checked={config.charts.includeCharts}
                          onCheckedChange={(checked) => 
                            updateNestedConfig('charts', { includeCharts: checked })
                          }
                        />
                      </div>

                      {config.charts.includeCharts && (
                        <>
                          <div className="space-y-2">
                            <Label>Tamaño de gráficos</Label>
                            <Select
                              value={config.charts.chartSize}
                              onValueChange={(value) => 
                                updateNestedConfig('charts', { chartSize: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="small">Pequeño</SelectItem>
                                <SelectItem value="medium">Mediano</SelectItem>
                                <SelectItem value="large">Grande</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Esquema de colores</Label>
                            <Select
                              value={config.charts.chartColorScheme}
                              onValueChange={(value) => 
                                updateNestedConfig('charts', { chartColorScheme: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="blue">Azul profesional</SelectItem>
                                <SelectItem value="multi">Multicolor</SelectItem>
                                <SelectItem value="gradient">Gradientes</SelectItem>
                                <SelectItem value="monochrome">Monocromático</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {/* Step 4: Data Filters */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Rango de fechas</Label>
                    <Select
                      value={config.filters.dateRange}
                      onValueChange={(value) => 
                        updateNestedConfig('filters', { dateRange: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="last_7_days">Últimos 7 días</SelectItem>
                        <SelectItem value="last_30_days">Últimos 30 días</SelectItem>
                        <SelectItem value="last_90_days">Últimos 90 días</SelectItem>
                        <SelectItem value="last_year">Último año</SelectItem>
                        <SelectItem value="all_time">Todo el tiempo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Nivel mínimo de stock</Label>
                    <Input
                      type="number"
                      value={config.filters.minimumStockLevel}
                      onChange={(e) => 
                        updateNestedConfig('filters', { minimumStockLevel: parseInt(e.target.value) || 0 })
                      }
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Incluir productos sin stock</Label>
                      <p className="text-sm text-gray-600">Mostrar productos con inventario cero</p>
                    </div>
                    <Switch
                      checked={config.filters.includeOutOfStock}
                      onCheckedChange={(checked) => 
                        updateNestedConfig('filters', { includeOutOfStock: checked })
                      }
                    />
                  </div>

                  {availableCategories.length > 0 && (
                    <div className="space-y-2">
                      <Label>Categorías a incluir</Label>
                      <div className="flex flex-wrap gap-2">
                        {availableCategories.map(category => (
                          <Badge
                            key={category}
                            variant={config.filters.categories.includes(category) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => {
                              const categories = config.filters.categories.includes(category)
                                ? config.filters.categories.filter(c => c !== category)
                                : [...config.filters.categories, category];
                              updateNestedConfig('filters', { categories });
                            }}
                          >
                            {category}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">
                        {config.filters.categories.length === 0 
                          ? "Todas las categorías seleccionadas" 
                          : `${config.filters.categories.length} categorías seleccionadas`
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 5: Preview */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">¡Tu reporte está listo!</h3>
                      <p className="text-sm text-gray-600">
                        Revisa la configuración y genera tu reporte personalizado
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Configuración General:</h4>
                      <ul className="space-y-1 text-gray-600">
                        <li>• Título: {config.title}</li>
                        <li>• Layout: {config.design.layout}</li>
                        <li>• Tema: {config.design.colorTheme}</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Secciones incluidas:</h4>
                      <ul className="space-y-1 text-gray-600">
                        {Object.entries(config.sections)
                          .filter(([_, enabled]) => enabled)
                          .map(([section, _]) => (
                            <li key={section}>• {section}</li>
                          ))
                        }
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => onGenerateReport(config)}
                      disabled={isGenerating}
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
                    >
                      {isGenerating ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="mr-2"
                          >
                            <Sparkles className="h-5 w-5" />
                          </motion.div>
                          Generando reporte...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-5 w-5" />
                          Generar Reporte PDF
                        </>
                      )}
                    </Button>
                  </motion.div>
                  <p className="text-sm text-gray-600 mt-2">
                    El reporte se descargará automáticamente
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          {currentStep < WIZARD_STEPS.length - 1 && (
            <Button
              onClick={nextStep}
              className="flex items-center gap-2"
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}