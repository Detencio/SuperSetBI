import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Package, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  MoreHorizontal
} from "lucide-react";
import { useCurrency } from "@/lib/currency-utils";

interface EnhancedProductTableProps {
  products?: any[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  stockFilter: string;
  onStockChange: (value: string) => void;
  isLoading?: boolean;
}

export default function EnhancedProductTable({
  products = [],
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  stockFilter,
  onStockChange,
  isLoading
}: EnhancedProductTableProps) {
  const { currentCurrency, formatDisplayCurrency } = useCurrency();

  // Funciones para análisis de stock
  const getStockStatus = (stock: number, minStock: number = 10, maxStock: number = 30) => {
    if (stock === 0) {
      return { 
        label: "Agotado", 
        color: "bg-red-100 text-red-800 border-red-200", 
        indicator: "bg-red-500",
        priority: 1
      };
    }
    if (stock <= minStock * 0.5) {
      return { 
        label: "Crítico", 
        color: "bg-orange-100 text-orange-800 border-orange-200", 
        indicator: "bg-orange-500",
        priority: 2
      };
    }
    if (stock <= minStock) {
      return { 
        label: "Stock Bajo", 
        color: "bg-yellow-100 text-yellow-800 border-yellow-200", 
        indicator: "bg-yellow-500",
        priority: 3
      };
    }
    if (stock <= maxStock) {
      return { 
        label: "Óptimo", 
        color: "bg-green-100 text-green-800 border-green-200", 
        indicator: "bg-green-500",
        priority: 4
      };
    }
    return { 
      label: "Exceso", 
      color: "bg-blue-100 text-blue-800 border-blue-200", 
      indicator: "bg-blue-500",
      priority: 5
    };
  };

  const getABCClassification = (product: any, allProducts: any[]) => {
    const totalValue = allProducts.reduce((sum, p) => sum + (p.price * p.stock), 0);
    const productValue = product.price * product.stock;
    const percentage = (productValue / totalValue) * 100;
    
    if (percentage >= 20) return { class: 'A', color: 'bg-green-100 text-green-800', priority: 'Alta' };
    if (percentage >= 5) return { class: 'B', color: 'bg-yellow-100 text-yellow-800', priority: 'Media' };
    return { class: 'C', color: 'bg-gray-100 text-gray-800', priority: 'Baja' };
  };

  const getRotationIndicator = (monthlyDemand: number = 0) => {
    if (monthlyDemand >= 30) return { icon: TrendingUp, color: "text-green-500", label: "Alta" };
    if (monthlyDemand >= 10) return { icon: Clock, color: "text-yellow-500", label: "Media" };
    return { icon: TrendingDown, color: "text-red-500", label: "Baja" };
  };

  // Filtrar productos
  const filteredProducts = products.filter((product: any) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    
    let matchesStock = true;
    if (stockFilter === "low") {
      matchesStock = product.stock <= (product.minStock || 10);
    } else if (stockFilter === "out") {
      matchesStock = product.stock === 0;
    } else if (stockFilter === "excess") {
      matchesStock = product.stock >= (product.maxStock || 30);
    }
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  // Categorías únicas
  const categories = [...new Set(products.map(p => p.category))].filter(Boolean);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros y búsqueda mejorados */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nombre, SKU o descripción..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={onCategoryChange}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={stockFilter} onValueChange={onStockChange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="out">Agotados</SelectItem>
                  <SelectItem value="low">Stock Bajo</SelectItem>
                  <SelectItem value="excess">Exceso</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla mejorada con códigos de color */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Lista de Productos ({filteredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ABC
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rotación
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product: any) => {
                  const stockStatus = getStockStatus(product.stock, product.minStock, product.maxStock);
                  const abcClass = getABCClassification(product, products);
                  const rotation = getRotationIndicator(product.monthlyDemand);
                  const totalValue = product.price * product.stock;
                  const RotationIcon = rotation.icon;

                  return (
                    <tr 
                      key={product.id} 
                      className={`hover:bg-gray-50 transition-colors ${
                        stockStatus.priority <= 2 ? 'bg-red-50' : 
                        stockStatus.priority === 3 ? 'bg-yellow-50' : ''
                      }`}
                    >
                      {/* Indicador de estado visual */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${stockStatus.indicator}`} />
                          <Badge className={stockStatus.color}>
                            {stockStatus.label}
                          </Badge>
                        </div>
                      </td>

                      {/* Información del producto */}
                      <td className="px-4 py-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.sku && `SKU: ${product.sku}`}
                            {product.category && ` • ${product.category}`}
                          </div>
                        </div>
                      </td>

                      {/* Stock con indicadores visuales */}
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">
                              {product.stock.toLocaleString()}
                            </span>
                            {product.stock <= (product.minStock || 10) && (
                              <AlertTriangle className="h-4 w-4 text-orange-500" />
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            Min: {product.minStock || 10} • Max: {product.maxStock || 30}
                          </div>
                          {/* Barra de progreso visual */}
                          <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${stockStatus.indicator}`}
                              style={{ 
                                width: `${Math.min((product.stock / (product.maxStock || 30)) * 100, 100)}%` 
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Precio */}
                      <td className="px-4 py-4">
                        <span className="font-medium text-gray-900">
                          {formatDisplayCurrency(product.price)}
                        </span>
                      </td>

                      {/* Valor total */}
                      <td className="px-4 py-4">
                        <span className="font-semibold text-gray-900">
                          {formatDisplayCurrency(totalValue)}
                        </span>
                      </td>

                      {/* Clasificación ABC */}
                      <td className="px-4 py-4">
                        <Badge className={abcClass.color}>
                          Clase {abcClass.class}
                        </Badge>
                        <div className="text-xs text-gray-500 mt-1">
                          {abcClass.priority} prioridad
                        </div>
                      </td>

                      {/* Rotación */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <RotationIcon className={`h-4 w-4 ${rotation.color}`} />
                          <span className="text-sm font-medium">
                            {rotation.label}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {product.monthlyDemand || 0}/mes
                        </div>
                      </td>

                      {/* Acciones */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron productos
              </h3>
              <p className="text-gray-500">
                Intenta ajustar los filtros de búsqueda
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leyenda de códigos de color */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Leyenda de Estado de Stock</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>Agotado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span>Crítico</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span>Stock Bajo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Óptimo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>Exceso</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}