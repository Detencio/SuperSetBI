import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign, 
  Package, 
  Target, 
  Activity,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Zap,
  Shield
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from "recharts";
import { useCurrency } from "@/lib/currency-utils";
import { Skeleton } from "@/components/ui/skeleton";

interface InventoryExecutiveDashboardProps {
  products: any[];
  kpis: any;
  isLoading?: boolean;
  timePeriod?: string;
}

// Colores para los gráficos (paleta profesional)
const CHART_COLORS = {
  primary: '#0369a1',
  secondary: '#0891b2', 
  success: '#059669',
  warning: '#d97706',
  danger: '#dc2626',
  info: '#7c3aed',
  neutral: '#6b7280'
};

const PIE_COLORS = [CHART_COLORS.primary, CHART_COLORS.secondary, CHART_COLORS.success, CHART_COLORS.warning, CHART_COLORS.danger, CHART_COLORS.info];

export default function InventoryExecutiveDashboard({ 
  products = [], 
  kpis = null, 
  isLoading = false,
  timePeriod = "30"
}: InventoryExecutiveDashboardProps) {
  const { formatDisplayCurrency } = useCurrency();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array(4).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-600">No hay datos de inventario disponibles</p>
      </div>
    );
  }

  // Cálculos de métricas ejecutivas
  const totalProducts = products.length;
  const totalStockValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const lowStockCount = products.filter(p => p.stock <= (p.minStock || 10)).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const overStockCount = products.filter(p => p.maxStock && p.stock >= p.maxStock * 1.2).length;

  // Análisis por categoría
  const categoryAnalysis = products.reduce((acc: any, product) => {
    const category = product.category || 'Sin Categoría';
    if (!acc[category]) {
      acc[category] = {
        name: category,
        count: 0,
        value: 0,
        stock: 0
      };
    }
    acc[category].count += 1;
    acc[category].value += product.price * product.stock;
    acc[category].stock += product.stock;
    return acc;
  }, {});

  const categoryData = Object.values(categoryAnalysis).map((cat: any) => ({
    ...cat,
    value: Math.round(cat.value)
  }));

  // Análisis de rotación de inventario
  const turnoverAnalysis = products.map(product => {
    const monthlySales = Math.random() * 50 + 10; // Simulado - en producción usar datos reales
    const turnover = product.stock > 0 ? (monthlySales * 12) / product.stock : 0;
    return {
      name: product.name,
      turnover: Math.round(turnover * 100) / 100,
      stock: product.stock,
      value: product.price * product.stock,
      category: product.category
    };
  }).sort((a, b) => b.turnover - a.turnover).slice(0, 10);

  // Estado del inventario para gráfico de barras
  const inventoryStatusData = [
    { name: 'Stock Normal', count: totalProducts - lowStockCount - outOfStockCount - overStockCount, color: CHART_COLORS.success },
    { name: 'Stock Bajo', count: lowStockCount, color: CHART_COLORS.warning },
    { name: 'Sin Stock', count: outOfStockCount, color: CHART_COLORS.danger },
    { name: 'Sobre Stock', count: overStockCount, color: CHART_COLORS.info }
  ];

  // Análisis de ABC (valor de inventario)
  const sortedByValue = [...products]
    .map(p => ({ ...p, totalValue: p.price * p.stock }))
    .sort((a, b) => b.totalValue - a.totalValue);
  
  const totalInventoryValue = sortedByValue.reduce((sum, p) => sum + p.totalValue, 0);
  let cumulativeValue = 0;
  const abcAnalysis = sortedByValue.map(product => {
    cumulativeValue += product.totalValue;
    const cumulativePercentage = (cumulativeValue / totalInventoryValue) * 100;
    let category = 'C';
    if (cumulativePercentage <= 80) category = 'A';
    else if (cumulativePercentage <= 95) category = 'B';
    
    return {
      ...product,
      abcCategory: category,
      cumulativePercentage: Math.round(cumulativePercentage * 100) / 100
    };
  });

  const abcData = [
    { name: 'Categoría A', count: abcAnalysis.filter(p => p.abcCategory === 'A').length, value: 'Alto Valor' },
    { name: 'Categoría B', count: abcAnalysis.filter(p => p.abcCategory === 'B').length, value: 'Medio Valor' },
    { name: 'Categoría C', count: abcAnalysis.filter(p => p.abcCategory === 'C').length, value: 'Bajo Valor' }
  ];

  // Métricas de rendimiento
  const performanceMetrics = [
    {
      title: 'Eficiencia de Stock',
      value: Math.round((1 - (lowStockCount + outOfStockCount) / totalProducts) * 100),
      target: 95,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Rotación Promedio',
      value: Math.round(turnoverAnalysis.reduce((sum, item) => sum + item.turnover, 0) / turnoverAnalysis.length * 100) / 100,
      target: 6,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Nivel de Servicio',
      value: Math.round((1 - outOfStockCount / totalProducts) * 100),
      target: 98,
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  // Tendencia de stock basada en el período seleccionado
  const periodDays = parseInt(timePeriod);
  const periodLabel = periodDays === 7 ? "7 días" : 
                     periodDays === 30 ? "30 días" : 
                     periodDays === 90 ? "3 meses" : 
                     periodDays === 180 ? "6 meses" : "año";
  
  const stockTrendData = Array.from({ length: Math.min(periodDays, 30) }, (_, i) => ({
    day: i + 1,
    stock: Math.floor(Math.random() * 1000 + 800),
    value: Math.floor(Math.random() * 50000 + 40000),
    alerts: Math.floor(Math.random() * 5)
  }));

  return (
    <div className="space-y-6">
      {/* KPIs Ejecutivos Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Total Inventario</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatDisplayCurrency(totalStockValue)}
                </p>
                <div className="flex items-center mt-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">+8.2%</span>
                  <span className="text-gray-500 ml-1">vs mes anterior</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Productos Activos</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalProducts}</p>
                <div className="flex items-center mt-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">{totalProducts - outOfStockCount} disponibles</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alertas Críticas</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{lowStockCount + outOfStockCount}</p>
                <div className="flex items-center mt-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-orange-500 mr-1" />
                  <span className="text-orange-600 font-medium">{outOfStockCount} sin stock</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Eficiencia Global</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {Math.round((1 - (lowStockCount + outOfStockCount) / totalProducts) * 100)}%
                </p>
                <div className="flex items-center mt-2 text-sm">
                  <Zap className="h-4 w-4 text-purple-500 mr-1" />
                  <span className="text-purple-600 font-medium">Objetivo: 95%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos y Análisis Detallado */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Categorías
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Rendimiento
          </TabsTrigger>
          <TabsTrigger value="abc" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Análisis ABC
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Estado del Inventario */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Estado del Inventario
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={inventoryStatusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [value, 'Productos']}
                      labelStyle={{ color: '#374151' }}
                    />
                    <Bar dataKey="count" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Tendencia de Valor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Tendencia de Valor ({periodLabel})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={stockTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'value' ? formatDisplayCurrency(value) : value,
                        name === 'value' ? 'Valor' : name === 'stock' ? 'Stock' : 'Alertas'
                      ]}
                    />
                    <Area type="monotone" dataKey="value" stackId="1" stroke={CHART_COLORS.primary} fill={CHART_COLORS.primary} fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Métricas de Rendimiento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {performanceMetrics.map((metric, index) => {
              const IconComponent = metric.icon;
              const progress = Math.min((metric.value / metric.target) * 100, 100);
              const isOnTarget = metric.value >= metric.target;
              
              return (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 ${metric.bgColor} rounded-lg flex items-center justify-center`}>
                        <IconComponent className={`h-6 w-6 ${metric.color}`} />
                      </div>
                      <Badge variant={isOnTarget ? "success" : "warning"}>
                        {isOnTarget ? "En objetivo" : "Fuera de objetivo"}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{metric.title}</h3>
                    <div className="flex items-end justify-between mb-2">
                      <span className="text-2xl font-bold text-gray-900">
                        {metric.value}{metric.title.includes('Eficiencia') || metric.title.includes('Nivel') ? '%' : 'x'}
                      </span>
                      <span className="text-sm text-gray-500">
                        Meta: {metric.target}{metric.title.includes('Eficiencia') || metric.title.includes('Nivel') ? '%' : 'x'}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribución por Categorías */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Categorías</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatDisplayCurrency(value)} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Análisis por Categoría */}
            <Card>
              <CardHeader>
                <CardTitle>Análisis por Categoría</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryData.map((category, index) => (
                    <div key={category.name} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                        />
                        <div>
                          <h4 className="font-medium text-gray-900">{category.name}</h4>
                          <p className="text-sm text-gray-500">{category.count} productos</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatDisplayCurrency(category.value)}
                        </p>
                        <p className="text-sm text-gray-500">{category.stock} unidades</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Productos por Rotación */}
            <Card>
              <CardHeader>
                <CardTitle>Top 10 - Rotación de Inventario</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {turnoverAnalysis.slice(0, 10).map((product, index) => (
                    <div key={product.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="w-8 h-8 p-0 flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <div>
                          <h4 className="font-medium text-gray-900">{product.name}</h4>
                          <p className="text-sm text-gray-500">{product.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{product.turnover}x</p>
                        <p className="text-sm text-gray-500">{product.stock} stock</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Gráfico de Rotación */}
            <Card>
              <CardHeader>
                <CardTitle>Rotación por Categoría</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={turnoverAnalysis.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [value + 'x', 'Rotación']}
                      labelStyle={{ color: '#374151' }}
                    />
                    <Bar dataKey="turnover" fill={CHART_COLORS.secondary} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="abc" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Análisis ABC */}
            <Card>
              <CardHeader>
                <CardTitle>Clasificación ABC</CardTitle>
                <p className="text-sm text-gray-600">Análisis de valor de inventario según metodología ABC</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {abcData.map((category, index) => {
                    const colors = ['bg-red-100 text-red-800', 'bg-yellow-100 text-yellow-800', 'bg-green-100 text-green-800'];
                    const percentage = Math.round((category.count / totalProducts) * 100);
                    
                    return (
                      <div key={category.name} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge className={colors[index]}>
                            {category.name.split(' ')[1]}
                          </Badge>
                          <div>
                            <h4 className="font-medium text-gray-900">{category.name}</h4>
                            <p className="text-sm text-gray-500">{category.value}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900">{category.count}</p>
                          <p className="text-sm text-gray-500">{percentage}% del total</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Distribución ABC */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución ABC</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={abcData}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) => `${name.split(' ')[1]} ${(percent * 100).toFixed(1)}%`}
                    >
                      {abcData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={[CHART_COLORS.danger, CHART_COLORS.warning, CHART_COLORS.success][index]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [value, 'Productos']} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recomendaciones Estratégicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Recomendaciones Estratégicas ABC
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                  <Badge className="bg-red-100 text-red-800 mb-2">Categoría A</Badge>
                  <h4 className="font-semibold text-gray-900 mb-2">Alto Control</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Seguimiento diario</li>
                    <li>• Stock de seguridad mínimo</li>
                    <li>• Revisión semanal de demanda</li>
                    <li>• Proveedores confiables</li>
                  </ul>
                </div>
                
                <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                  <Badge className="bg-yellow-100 text-yellow-800 mb-2">Categoría B</Badge>
                  <h4 className="font-semibold text-gray-900 mb-2">Control Moderado</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Seguimiento semanal</li>
                    <li>• Stock de seguridad medio</li>
                    <li>• Revisión mensual</li>
                    <li>• Múltiples proveedores</li>
                  </ul>
                </div>
                
                <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                  <Badge className="bg-green-100 text-green-800 mb-2">Categoría C</Badge>
                  <h4 className="font-semibold text-gray-900 mb-2">Control Básico</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Seguimiento mensual</li>
                    <li>• Stock de seguridad alto</li>
                    <li>• Revisión trimestral</li>
                    <li>• Optimizar costos</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}