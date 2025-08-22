import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  ShoppingCart, 
  DollarSign, 
  Package, 
  Target,
  Brain,
  Zap,
  CheckCircle
} from "lucide-react";
import { useCurrency, formatCurrency } from "@/lib/currency-utils";

interface InventoryRecommendationsProps {
  products?: any[];
  analytics?: any;
  isLoading?: boolean;
}

interface Recommendation {
  id: string;
  type: 'REORDER' | 'LIQUIDATE' | 'OPTIMIZE' | 'ALERT' | 'OPPORTUNITY';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  impact: string;
  action: string;
  product?: any;
  value?: number;
  savings?: number;
  icon: any;
  color: string;
}

export default function InventoryRecommendations({ products = [], analytics, isLoading }: InventoryRecommendationsProps) {
  const { currentCurrency } = useCurrency();

  const formatDisplayCurrency = (value: number) => {
    return formatCurrency(value, currentCurrency.code, { 
      showSymbol: true, 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-8 bg-gray-200 rounded w-1/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Generar recomendaciones inteligentes basadas en análisis de datos
  const generateRecommendations = (): Recommendation[] => {
    const recommendations: Recommendation[] = [];

    products.forEach(product => {
      const stock = product.stock || 0;
      const minStock = product.minStock || 10;
      const maxStock = product.maxStock || minStock * 3;
      const price = product.price || 0;
      const monthlyDemand = product.monthlyDemand || Math.floor(Math.random() * 30) + 5;
      const daysOfInventory = stock > 0 ? Math.round((stock / monthlyDemand) * 30) : 0;

      // Recomendación crítica: Stock agotado
      if (stock === 0) {
        recommendations.push({
          id: `reorder-critical-${product.id}`,
          type: 'REORDER',
          priority: 'CRITICAL',
          title: `¡STOCK AGOTADO! - ${product.name}`,
          description: `Producto sin existencias. Demanda mensual promedio: ${monthlyDemand} unidades.`,
          impact: 'Pérdida de ventas inmediata',
          action: `Reponer urgentemente ${monthlyDemand * 2} unidades`,
          product,
          value: monthlyDemand * 2 * price,
          icon: AlertTriangle,
          color: 'border-red-500 bg-red-50'
        });
      }
      // Recomendación alta: Stock bajo
      else if (stock <= minStock * 0.5) {
        recommendations.push({
          id: `reorder-high-${product.id}`,
          type: 'REORDER',
          priority: 'HIGH',
          title: `Stock Crítico - ${product.name}`,
          description: `Solo ${stock} unidades disponibles. Punto de reorden: ${minStock} unidades.`,
          impact: `Riesgo de quiebre en ${Math.round(stock / monthlyDemand * 30)} días`,
          action: `Reponer ${maxStock - stock} unidades`,
          product,
          value: (maxStock - stock) * price,
          icon: ShoppingCart,
          color: 'border-orange-500 bg-orange-50'
        });
      }
      // Recomendación de liquidación: Exceso de stock
      else if (stock >= maxStock * 1.5 && daysOfInventory > 90) {
        const excessStock = stock - maxStock;
        const potentialSavings = excessStock * price * 0.1; // 10% de ahorro en costos de almacenamiento
        
        recommendations.push({
          id: `liquidate-${product.id}`,
          type: 'LIQUIDATE',
          priority: 'MEDIUM',
          title: `Exceso de Inventario - ${product.name}`,
          description: `${excessStock} unidades en exceso. Más de ${daysOfInventory} días de inventario.`,
          impact: `Ahorro potencial en costos de almacenamiento`,
          action: `Considerar promoción o liquidación`,
          product,
          value: excessStock * price,
          savings: potentialSavings,
          icon: TrendingDown,
          color: 'border-purple-500 bg-purple-50'
        });
      }
      // Oportunidad: Producto de alta rotación con stock óptimo
      else if (monthlyDemand > 20 && stock > minStock && stock < maxStock) {
        recommendations.push({
          id: `opportunity-${product.id}`,
          type: 'OPPORTUNITY',
          priority: 'LOW',
          title: `Producto Estrella - ${product.name}`,
          description: `Alta demanda (${monthlyDemand}/mes) con stock bien gestionado.`,
          impact: 'Optimización exitosa del inventario',
          action: 'Mantener niveles actuales',
          product,
          icon: Target,
          color: 'border-green-500 bg-green-50'
        });
      }
    });

    // Recomendaciones de análisis general
    const lowStockCount = products.filter(p => p.stock <= (p.minStock || 10)).length;
    const outOfStockCount = products.filter(p => p.stock === 0).length;
    const overStockCount = products.filter(p => p.stock >= (p.maxStock || 30)).length;

    if (lowStockCount > products.length * 0.2) {
      recommendations.push({
        id: 'general-stock-alert',
        type: 'ALERT',
        priority: 'HIGH',
        title: 'Alerta General de Stock',
        description: `${lowStockCount} productos (${Math.round(lowStockCount/products.length*100)}%) tienen stock bajo.`,
        impact: 'Riesgo sistémico de desabastecimiento',
        action: 'Revisar política de reposición global',
        icon: Brain,
        color: 'border-yellow-500 bg-yellow-50'
      });
    }

    if (analytics?.inventoryTurnover < 4) {
      recommendations.push({
        id: 'turnover-optimization',
        type: 'OPTIMIZE',
        priority: 'MEDIUM',
        title: 'Optimización de Rotación',
        description: `Rotación de inventario baja (${analytics.inventoryTurnover?.toFixed(1)}x anual).`,
        impact: 'Capital inmovilizado en inventario',
        action: 'Revisar mix de productos y niveles de stock',
        icon: Zap,
        color: 'border-blue-500 bg-blue-50'
      });
    }

    // Ordenar por prioridad
    const priorityOrder = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
    return recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  };

  const recommendations = generateRecommendations();

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return <Badge variant="destructive">Crítico</Badge>;
      case 'HIGH':
        return <Badge variant="outline" className="border-orange-500 text-orange-700">Alto</Badge>;
      case 'MEDIUM':
        return <Badge variant="outline" className="border-blue-500 text-blue-700">Medio</Badge>;
      case 'LOW':
        return <Badge variant="secondary">Bajo</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'REORDER':
        return ShoppingCart;
      case 'LIQUIDATE':
        return TrendingDown;
      case 'OPTIMIZE':
        return Zap;
      case 'ALERT':
        return AlertTriangle;
      case 'OPPORTUNITY':
        return Target;
      default:
        return Package;
    }
  };

  return (
    <div className="space-y-6">
      {/* Resumen de Recomendaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-500" />
            Panel de Recomendaciones Inteligentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-700">
                {recommendations.filter(r => r.priority === 'CRITICAL').length}
              </div>
              <div className="text-sm text-red-600">Críticas</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-2xl font-bold text-orange-700">
                {recommendations.filter(r => r.priority === 'HIGH').length}
              </div>
              <div className="text-sm text-orange-600">Alta Prioridad</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">
                {recommendations.filter(r => r.priority === 'MEDIUM').length}
              </div>
              <div className="text-sm text-blue-600">Media Prioridad</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-700">
                {recommendations.filter(r => r.type === 'OPPORTUNITY').length}
              </div>
              <div className="text-sm text-green-600">Oportunidades</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Recomendaciones */}
      <div className="space-y-4">
        {recommendations.slice(0, 10).map((rec) => {
          const Icon = rec.icon;
          
          return (
            <Card key={rec.id} className={`${rec.color} transition-all hover:shadow-md`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                        {getPriorityBadge(rec.priority)}
                      </div>
                      
                      <p className="text-sm text-gray-700">{rec.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-600">
                          <strong>Impacto:</strong> {rec.impact}
                        </span>
                        {rec.value && (
                          <span className="text-gray-600">
                            <strong>Valor:</strong> {formatDisplayCurrency(rec.value)}
                          </span>
                        )}
                        {rec.savings && (
                          <span className="text-green-600">
                            <strong>Ahorro:</strong> {formatDisplayCurrency(rec.savings)}
                          </span>
                        )}
                      </div>
                      
                      <Alert className="mt-3">
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Acción recomendada:</strong> {rec.action}
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button size="sm" variant="outline">
                      Ver Detalles
                    </Button>
                    {(rec.type === 'REORDER' || rec.type === 'LIQUIDATE') && (
                      <Button size="sm">
                        {rec.type === 'REORDER' ? 'Crear Orden' : 'Crear Promoción'}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {recommendations.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Target className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ¡Excelente Gestión de Inventario!
            </h3>
            <p className="text-gray-600">
              No hay recomendaciones críticas en este momento. Tu inventario está bien optimizado.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}