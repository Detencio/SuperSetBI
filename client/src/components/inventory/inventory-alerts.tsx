import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  AlertCircle, 
  Clock, 
  Package,
  X,
  ArrowRight
} from "lucide-react";

interface InventoryAlert {
  productId: string;
  productName: string;
  alertType: string;
  priority: string;
  message: string;
  threshold?: number;
  currentValue?: number;
}

interface InventoryAlertsProps {
  alerts: InventoryAlert[];
  isLoading: boolean;
}

export default function InventoryAlerts({ alerts, isLoading }: InventoryAlertsProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'high':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'high':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'medium':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Package className="h-5 w-5 text-blue-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    
    return (
      <Badge 
        variant="outline" 
        className={`${colors[priority as keyof typeof colors] || colors.low} text-xs font-medium`}
      >
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const getAlertTypeLabel = (alertType: string) => {
    const types = {
      low_stock: 'Stock Bajo',
      out_of_stock: 'Sin Stock',
      excess_stock: 'Exceso Stock',
      expiring: 'Próximo a Vencer',
    };
    return types[alertType as keyof typeof types] || alertType;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertas de Inventario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-gray-200 rounded"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-48"></div>
                    </div>
                  </div>
                  <div className="w-16 h-6 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const criticalAlerts = alerts.filter(alert => alert.priority === 'critical');
  const highAlerts = alerts.filter(alert => alert.priority === 'high');
  const otherAlerts = alerts.filter(alert => !['critical', 'high'].includes(alert.priority));

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertas de Inventario
          </CardTitle>
          <Badge variant="outline" className="text-sm">
            {alerts.length} alertas activas
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No hay alertas activas</p>
            <p className="text-gray-400 text-sm">Tu inventario está funcionando correctamente</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Critical Alerts */}
            {criticalAlerts.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-red-700 mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Críticas ({criticalAlerts.length})
                </h4>
                <div className="space-y-3">
                  {criticalAlerts.map((alert, index) => (
                    <div
                      key={`critical-${index}`}
                      className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${getPriorityColor(alert.priority)}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getPriorityIcon(alert.priority)}
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-sm">{alert.productName}</p>
                              <Badge variant="secondary" className="text-xs">
                                {getAlertTypeLabel(alert.alertType)}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-700">{alert.message}</p>
                            {alert.threshold !== undefined && alert.currentValue !== undefined && (
                              <div className="flex items-center gap-1 mt-1 text-xs text-gray-600">
                                <span>Actual: {alert.currentValue}</span>
                                <ArrowRight className="h-3 w-3" />
                                <span>Umbral: {alert.threshold}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getPriorityBadge(alert.priority)}
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-xs h-8 px-3"
                          >
                            Resolver
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* High Priority Alerts */}
            {highAlerts.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-orange-700 mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Alta Prioridad ({highAlerts.length})
                </h4>
                <div className="space-y-3">
                  {highAlerts.map((alert, index) => (
                    <div
                      key={`high-${index}`}
                      className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${getPriorityColor(alert.priority)}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getPriorityIcon(alert.priority)}
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-sm">{alert.productName}</p>
                              <Badge variant="secondary" className="text-xs">
                                {getAlertTypeLabel(alert.alertType)}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-700">{alert.message}</p>
                            {alert.threshold !== undefined && alert.currentValue !== undefined && (
                              <div className="flex items-center gap-1 mt-1 text-xs text-gray-600">
                                <span>Actual: {alert.currentValue}</span>
                                <ArrowRight className="h-3 w-3" />
                                <span>Umbral: {alert.threshold}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getPriorityBadge(alert.priority)}
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-xs h-8 px-3"
                          >
                            Resolver
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Other Alerts */}
            {otherAlerts.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Otras Alertas ({otherAlerts.length})
                </h4>
                <div className="space-y-3">
                  {otherAlerts.map((alert, index) => (
                    <div
                      key={`other-${index}`}
                      className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${getPriorityColor(alert.priority)}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getPriorityIcon(alert.priority)}
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-sm">{alert.productName}</p>
                              <Badge variant="secondary" className="text-xs">
                                {getAlertTypeLabel(alert.alertType)}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-700">{alert.message}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getPriorityBadge(alert.priority)}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-xs h-8 px-2"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}