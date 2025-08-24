import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  BarChart3,
  Target,
  Clock,
  DollarSign,
  Zap
} from "lucide-react";

interface InventoryKPIs {
  totalStockValue: number;
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  excessStockProducts: number;
  inventoryTurnover: number;
  serviceLevel: number;
  daysOfInventory: number;
  abcDistribution: {
    A: number;
    B: number;
    C: number;
  };
  liquidityIndex: number;
  inventoryAccuracy: number;
}

interface InventoryKPIsProps {
  kpis: InventoryKPIs | null;
  isLoading: boolean;
}

import { useCurrency } from "@/lib/currency-utils";

export default function InventoryKPIs({ kpis, isLoading }: InventoryKPIsProps) {
  const { formatDisplayCurrency } = useCurrency();

  const getServiceLevelColor = (level: number) => {
    if (level >= 98) return "text-success";
    if (level >= 95) return "text-warning";
    return "text-danger";
  };

  const getTurnoverColor = (turnover: number) => {
    if (turnover >= 4) return "text-success";
    if (turnover >= 2) return "text-warning";
    return "text-danger";
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
        {Array(8).fill(0).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!kpis) return null;

  return (
    <div className="space-y-6">
      {/* Primary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Total Stock Value */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          whileHover={{ scale: 1.02, y: -2 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <motion.p 
                    className="text-text-secondary text-sm font-medium"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Valor Total Stock
                  </motion.p>
                  <motion.p 
                    className="text-2xl lg:text-3xl font-bold text-text-primary mt-2"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 120 }}
                  >
                    {formatDisplayCurrency(kpis.totalStockValue)}
                  </motion.p>
                </div>
                <motion.div 
                  className="w-12 h-12 bg-blue-500 bg-opacity-10 rounded-lg flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.4, type: "spring" }}
                  >
                    <DollarSign className="h-6 w-6 text-blue-500" />
                  </motion.div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Inventory Turnover */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm font-medium">Rotación de Inventario</p>
                <div className="flex items-center gap-2 mt-2">
                  <p className={`text-2xl lg:text-3xl font-bold ${getTurnoverColor(kpis.inventoryTurnover)}`}>
                    {kpis.inventoryTurnover}x
                  </p>
                  <Badge 
                    variant={kpis.inventoryTurnover >= 2 ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {kpis.inventoryTurnover >= 4 ? "Excelente" : kpis.inventoryTurnover >= 2 ? "Bueno" : "Mejorar"}
                  </Badge>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-500 bg-opacity-10 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Level */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm font-medium">Nivel de Servicio</p>
                <div className="flex items-center gap-2 mt-2">
                  <p className={`text-2xl lg:text-3xl font-bold ${getServiceLevelColor(kpis.serviceLevel)}`}>
                    {kpis.serviceLevel}%
                  </p>
                </div>
                <div className="mt-2">
                  <Progress value={kpis.serviceLevel} className="h-2" />
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-500 bg-opacity-10 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Days of Inventory */}
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm font-medium">Días de Inventario</p>
                <p className="text-2xl lg:text-3xl font-bold text-text-primary mt-2">
                  {kpis.daysOfInventory}
                </p>
                <p className="text-sm text-text-secondary">días de cobertura</p>
              </div>
              <div className="w-12 h-12 bg-orange-500 bg-opacity-10 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Stock Issues */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm font-medium">Productos Críticos</p>
                <p className="text-2xl lg:text-3xl font-bold text-danger mt-2">
                  {kpis.lowStockProducts}
                </p>
                <p className="text-sm text-text-secondary">stock bajo/agotado</p>
              </div>
              <div className="w-12 h-12 bg-danger bg-opacity-10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-danger" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liquidity Index */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm font-medium">Índice de Liquidez</p>
                <p className="text-2xl lg:text-3xl font-bold text-text-primary mt-2">
                  {kpis.liquidityIndex}%
                </p>
                <div className="mt-2">
                  <Progress value={kpis.liquidityIndex} className="h-2" />
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-500 bg-opacity-10 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Accuracy */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm font-medium">Precisión Inventario</p>
                <p className="text-2xl lg:text-3xl font-bold text-success mt-2">
                  {kpis.inventoryAccuracy}%
                </p>
                <div className="mt-2">
                  <Progress value={kpis.inventoryAccuracy} className="h-2" />
                </div>
              </div>
              <div className="w-12 h-12 bg-success bg-opacity-10 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ABC Distribution */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Clasificación ABC
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Clase A</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${kpis.abcDistribution.A}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-green-600">
                    {kpis.abcDistribution.A}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Clase B</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ width: `${kpis.abcDistribution.B}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-yellow-600">
                    {kpis.abcDistribution.B}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Clase C</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gray-500 h-2 rounded-full" 
                      style={{ width: `${kpis.abcDistribution.C}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-600">
                    {kpis.abcDistribution.C}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}