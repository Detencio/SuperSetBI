import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { TrendingUp, Package, AlertTriangle, BarChart3 } from "lucide-react";
import { useCurrency, formatCurrency } from "@/lib/currency-utils";

interface InventoryChartsProps {
  products?: any[];
  isLoading?: boolean;
}

export default function InventoryCharts({ products = [], isLoading }: InventoryChartsProps) {
  const { currentCurrency } = useCurrency();

  const formatDisplayCurrency = (value: number) => {
    return formatCurrency(value, currentCurrency.code, { 
      showSymbol: false, 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 rounded animate-pulse" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 rounded animate-pulse" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Preparar datos para análisis de tendencias por categoría
  const categoryData = products.reduce((acc: any, product: any) => {
    const category = product.category || 'Sin categoría';
    if (!acc[category]) {
      acc[category] = {
        category,
        totalValue: 0,
        totalStock: 0,
        products: 0,
        lowStock: 0
      };
    }
    acc[category].totalValue += product.price * product.stock;
    acc[category].totalStock += product.stock;
    acc[category].products += 1;
    if (product.stock <= (product.minStock || 10)) {
      acc[category].lowStock += 1;
    }
    return acc;
  }, {});

  const categoryChartData = Object.values(categoryData).map((cat: any) => ({
    name: cat.category,
    value: cat.totalValue,
    stock: cat.totalStock,
    products: cat.products,
    lowStock: cat.lowStock,
    riskLevel: (cat.lowStock / cat.products) * 100
  }));

  // Datos para análisis ABC
  const abcData = products
    .map(product => ({
      name: product.name,
      value: product.price * product.stock,
      rotation: product.monthlyDemand || Math.floor(Math.random() * 50) + 1
    }))
    .sort((a, b) => b.value - a.value)
    .map((product, index, array) => {
      const cumulative = array.slice(0, index + 1).reduce((sum, p) => sum + p.value, 0);
      const totalValue = array.reduce((sum, p) => sum + p.value, 0);
      const percentage = (cumulative / totalValue) * 100;
      
      let classification = 'C';
      if (percentage <= 80) classification = 'A';
      else if (percentage <= 95) classification = 'B';
      
      return {
        ...product,
        classification,
        percentage: percentage.toFixed(1)
      };
    });

  const abcSummary = {
    A: abcData.filter(p => p.classification === 'A').length,
    B: abcData.filter(p => p.classification === 'B').length,
    C: abcData.filter(p => p.classification === 'C').length
  };

  const abcChartData = [
    { name: 'Clase A', value: abcSummary.A, color: '#10b981', percentage: 80 },
    { name: 'Clase B', value: abcSummary.B, color: '#f59e0b', percentage: 15 },
    { name: 'Clase C', value: abcSummary.C, color: '#ef4444', percentage: 5 }
  ];

  // Datos de rotación de inventario
  const rotationData = products.map(product => ({
    name: product.name.length > 20 ? product.name.substring(0, 20) + '...' : product.name,
    rotation: product.monthlyDemand || Math.floor(Math.random() * 50) + 1,
    daysOfInventory: Math.round((product.stock / (product.monthlyDemand || 1)) * 30),
    category: product.category,
    value: product.price * product.stock
  })).sort((a, b) => b.rotation - a.rotation).slice(0, 10);

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Análisis por Categoría y Tendencias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Valor por Categoría */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Valor de Inventario por Categoría
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis tickFormatter={formatDisplayCurrency} />
                <Tooltip 
                  formatter={(value, name) => [
                    formatDisplayCurrency(Number(value)),
                    name === 'value' ? 'Valor Total' : name
                  ]}
                  labelFormatter={(label) => `Categoría: ${label}`}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Análisis ABC */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Clasificación ABC
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={abcChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percentage }) => `${name}: ${value} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {abcChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Análisis de Rotación y Riesgo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Productos por Rotación */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-purple-500" />
              Top 10 - Rotación de Inventario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={rotationData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={100}
                  fontSize={10}
                />
                <Tooltip 
                  formatter={(value, name) => [
                    value,
                    name === 'rotation' ? 'Rotación Mensual' : 
                    name === 'daysOfInventory' ? 'Días de Inventario' : name
                  ]}
                />
                <Bar dataKey="rotation" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Análisis de Riesgo por Categoría */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Nivel de Riesgo por Categoría
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={categoryChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    `${Number(value).toFixed(1)}%`,
                    'Nivel de Riesgo'
                  ]}
                  labelFormatter={(label) => `Categoría: ${label}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="riskLevel" 
                  stroke="#f59e0b" 
                  fill="#fef3c7" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tendencias Temporales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-500" />
            Análisis de Tendencias de Stock
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={categoryChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="totalStock" 
                stroke="#3b82f6" 
                strokeWidth={3}
                name="Stock Total"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="lowStock" 
                stroke="#ef4444" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Productos en Riesgo"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}