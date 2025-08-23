import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Lightbulb, AlertTriangle, TrendingUp, Sparkles, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

interface AIInsight {
  type: 'opportunity' | 'warning' | 'prediction' | 'recommendation';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'inventory' | 'sales' | 'collections' | 'general';
  confidence: number;
}

const getInsightIcon = (type: string) => {
  switch (type) {
    case 'opportunity':
      return Lightbulb;
    case 'warning':
      return AlertTriangle;
    case 'prediction':
      return TrendingUp;
    default:
      return Bot;
  }
};

const getInsightColor = (priority: string) => {
  switch (priority) {
    case 'critical':
      return 'bg-red-100 dark:bg-red-900';
    case 'high':
      return 'bg-orange-100 dark:bg-orange-900';
    case 'medium':
      return 'bg-yellow-100 dark:bg-yellow-900';
    case 'low':
      return 'bg-blue-100 dark:bg-blue-900';
    default:
      return 'bg-gray-100 dark:bg-gray-900';
  }
};

export default function AIInsights() {
  // Obtener insights automáticos del inventario
  const { data: inventoryInsights, isLoading } = useQuery<AIInsight[]>({
    queryKey: ['/api/ai/inventory-insights'],
    queryFn: () => fetch('/api/ai/inventory-insights').then(res => res.json()),
    refetchInterval: 5 * 60 * 1000, // Actualizar cada 5 minutos
  });

  const displayInsights = inventoryInsights?.slice(0, 3) || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-superset-blue" />
            <CardTitle className="text-lg font-semibold text-text-primary">
              Insights IA
            </CardTitle>
            <Badge variant="secondary" className="bg-superset-blue text-white text-xs">
              Powered by Gemini
            </Badge>
          </div>
          <Link href="/ai-assistant">
            <Button variant="outline" size="sm" data-testid="button-open-ai-assistant">
              <Sparkles className="h-4 w-4 mr-1" />
              Ver Más
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-superset-blue" />
            <span className="ml-2 text-muted-foreground">Generando insights...</span>
          </div>
        ) : displayInsights.length > 0 ? (
          <div className="space-y-4">
            {displayInsights.map((insight, index) => {
              const Icon = getInsightIcon(insight.type);
              const bgColor = getInsightColor(insight.priority);
              return (
                <div key={index} className={`p-4 ${bgColor} rounded-lg`}>
                  <div className="flex items-start space-x-3">
                    <Icon className="h-5 w-5 mt-1 text-gray-600 dark:text-gray-300" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                          {insight.title}
                        </p>
                        <Badge 
                          variant="secondary" 
                          className="text-xs"
                          data-testid={`badge-priority-${insight.priority}`}
                        >
                          {insight.priority}
                        </Badge>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-xs">
                        {insight.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {insight.category}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {Math.round(insight.confidence * 100)}% confianza
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <Bot className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-3">
              No hay insights disponibles en este momento
            </p>
            <Link href="/ai-assistant">
              <Button size="sm" data-testid="button-get-insights">
                <Sparkles className="h-4 w-4 mr-1" />
                Generar Análisis
              </Button>
            </Link>
          </div>
        )}
        
        {displayInsights.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <Link href="/ai-assistant">
              <Button variant="ghost" className="w-full" data-testid="button-chat-assistant">
                <Bot className="h-4 w-4 mr-2" />
                Chatear con el Asistente IA
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
