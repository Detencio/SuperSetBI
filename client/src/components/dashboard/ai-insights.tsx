import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Lightbulb, AlertTriangle, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const insights = [
  {
    type: 'opportunity',
    title: 'Oportunidad de Venta',
    message: 'Se proyecta un aumento del 18% en ventas si optimizas el inventario de "Producto Premium A"',
    icon: Lightbulb,
    bgColor: 'bg-superset-blue'
  },
  {
    type: 'warning',
    title: 'Alerta de Inventario',
    message: 'El stock de "Paquete Básico" estará agotado en 12 días según las tendencias actuales',
    icon: AlertTriangle,
    bgColor: 'bg-warning'
  },
  {
    type: 'prediction',
    title: 'Predicción de Cobranza',
    message: 'Se espera recuperar $89,450 en los próximos 15 días basado en patrones históricos',
    icon: TrendingUp,
    bgColor: 'bg-success'
  }
];

export default function AIInsights() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-superset-blue" />
          <CardTitle className="text-lg font-semibold text-text-primary">
            Insights IA
          </CardTitle>
          <Badge variant="secondary" className="bg-superset-blue text-white text-xs">
            BETA
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <div key={index} className={`p-4 ${insight.bgColor} bg-opacity-10 rounded-lg`}>
                <div className="flex items-start space-x-3">
                  <Icon className={`h-5 w-5 mt-1 ${insight.bgColor.replace('bg-', 'text-')}`} />
                  <div>
                    <p className="font-medium text-text-primary text-sm">{insight.title}</p>
                    <p className="text-text-secondary text-xs mt-1">{insight.message}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
