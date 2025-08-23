import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import AIAssistant from "@/components/AIAssistant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Sparkles, TrendingUp, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function AIAssistantPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedQuickPrompt, setSelectedQuickPrompt] = useState<string>('');

  // Obtener insights de inventario
  const { data: inventoryInsights } = useQuery({
    queryKey: ['/api/ai/inventory-insights'],
    queryFn: () => fetch('/api/ai/inventory-insights').then(res => res.json()),
  });

  const quickPrompts = [
    "¿Cuál es el estado actual de mi inventario?",
    "¿Qué productos debería reabastecer?",
    "¿Cuáles son mis productos más vendidos?",
    "¿Cómo están mis cobros pendientes?",
    "Dame un resumen de las ventas del mes",
    "¿Qué mejoras puedo hacer en mi negocio?"
  ];

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar 
          title="Asistente de IA"
          subtitle="Tu consultor inteligente de negocios"
          onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-4">
              <div className="bg-superset-blue p-3 rounded-lg">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-text-primary">
                  Asistente de IA
                </h1>
                <p className="text-text-secondary">
                  Tu consultor inteligente de negocios powered by Google Gemini
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chat Principal */}
              <div className="lg:col-span-2">
                <AIAssistant 
                  quickPrompt={selectedQuickPrompt}
                  onQuickPromptProcessed={() => setSelectedQuickPrompt('')}
                />
              </div>

              {/* Panel Lateral */}
              <div className="space-y-6">
                {/* Preguntas Rápidas */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Sparkles className="h-5 w-5 text-superset-blue" />
                      <span>Preguntas Rápidas</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {quickPrompts.map((prompt, index) => (
                        <button
                          key={index}
                          className="w-full text-left p-3 rounded-lg border border-border hover:bg-accent hover:text-accent-foreground transition-colors text-sm"
                          onClick={() => {
                            setSelectedQuickPrompt(prompt);
                          }}
                          data-testid={`quick-prompt-${index}`}
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Insights Rápidos */}
                {inventoryInsights && inventoryInsights.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        <span>Insights Automáticos</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {inventoryInsights.slice(0, 3).map((insight: any, index: number) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg border-l-4 ${
                              insight.priority === 'critical' ? 'border-red-500 bg-red-50 dark:bg-red-950' :
                              insight.priority === 'high' ? 'border-orange-500 bg-orange-50 dark:bg-orange-950' :
                              insight.priority === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950' :
                              'border-blue-500 bg-blue-50 dark:bg-blue-950'
                            }`}
                          >
                            <div className="flex items-start space-x-2">
                              {insight.priority === 'critical' || insight.priority === 'high' ? (
                                <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                              ) : (
                                <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5" />
                              )}
                              <div>
                                <h4 className="font-medium text-sm">{insight.title}</h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {insight.message}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Capacidades */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Bot className="h-5 w-5 text-superset-blue" />
                      <span>¿Qué puedo hacer?</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start space-x-2">
                        <span className="text-superset-blue">📊</span>
                        <div>
                          <p className="font-medium">Análisis de Datos</p>
                          <p className="text-muted-foreground text-xs">
                            Analizo tus ventas, inventario y cobranzas
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-superset-blue">💡</span>
                        <div>
                          <p className="font-medium">Recomendaciones</p>
                          <p className="text-muted-foreground text-xs">
                            Sugerencias personalizadas para tu negocio
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-superset-blue">🔮</span>
                        <div>
                          <p className="font-medium">Predicciones</p>
                          <p className="text-muted-foreground text-xs">
                            Proyecciones basadas en tendencias
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-superset-blue">⚠️</span>
                        <div>
                          <p className="font-medium">Alertas Inteligentes</p>
                          <p className="text-muted-foreground text-xs">
                            Te aviso sobre problemas importantes
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}