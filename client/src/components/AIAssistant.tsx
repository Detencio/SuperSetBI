import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Bot, User, Send, Sparkles, BarChart3, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIInsight {
  type: 'opportunity' | 'warning' | 'prediction' | 'recommendation';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'inventory' | 'sales' | 'collections' | 'general';
  confidence: number;
}

interface BusinessAnalysis {
  summary: string;
  insights: AIInsight[];
  recommendations: string[];
}

const priorityColors = {
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

const typeIcons = {
  opportunity: '🎯',
  warning: '⚠️',
  prediction: '🔮',
  recommendation: '💡'
};


interface AIAssistantProps {
  quickPrompt?: string;
  onQuickPromptProcessed?: () => void;
}

// Componente para formatear mensajes del asistente
const FormattedMessage = ({ content }: { content: string }) => {
  // Función para procesar texto con markdown básico
  const processMarkdown = (text: string) => {
    // Procesar texto en negrita **texto**
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        return (
          <strong key={index} className="font-semibold text-gray-900 dark:text-gray-100">
            {boldText}
          </strong>
        );
      }
      return part;
    });
  };

  // Función para formatear el texto con saltos de línea y listas
  const formatText = (text: string) => {
    // Dividir en párrafos
    const parts = text.split('\n\n');
    
    return parts.map((part, index) => {
      const trimmedPart = part.trim();
      if (!trimmedPart) return null;
      
      // Detectar listas (líneas que empiezan con -, *, •, números)
      if (trimmedPart.includes('\n*') || trimmedPart.includes('\n-') || trimmedPart.includes('\n•') || /\n\d+\./.test(trimmedPart)) {
        const lines = trimmedPart.split('\n');
        const title = lines[0];
        const listItems = lines.slice(1).filter(line => line.trim());
        
        return (
          <div key={index} className="mb-4">
            {title && !title.match(/^[-*•\d]/) && (
              <div className="font-medium mb-2 text-gray-900 dark:text-gray-100">
                {processMarkdown(title)}
              </div>
            )}
            <ul className="space-y-2 ml-4">
              {listItems.map((item, itemIndex) => {
                const cleanItem = item.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '').trim();
                if (!cleanItem) return null;
                return (
                  <li key={itemIndex} className="flex items-start text-sm">
                    <span className="text-superset-blue mr-3 flex-shrink-0 mt-1">•</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {processMarkdown(cleanItem)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      }
      
      // Detectar títulos o preguntas
      if (trimmedPart.length < 120 && (trimmedPart.endsWith(':') || trimmedPart.endsWith('?'))) {
        return (
          <h4 key={index} className="font-semibold mb-2 text-gray-900 dark:text-gray-100">
            {processMarkdown(trimmedPart)}
          </h4>
        );
      }
      
      // Párrafo normal
      return (
        <div key={index} className="mb-3 leading-relaxed text-gray-700 dark:text-gray-300">
          {processMarkdown(trimmedPart)}
        </div>
      );
    }).filter(Boolean);
  };
  
  return <div className="space-y-2">{formatText(content)}</div>;
};

export default function AIAssistant({ quickPrompt, onQuickPromptProcessed }: AIAssistantProps = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<BusinessAnalysis | null>(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'analysis'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Procesar preguntas rápidas
  useEffect(() => {
    if (quickPrompt && quickPrompt.trim()) {
      setInputMessage(quickPrompt);
      setActiveTab('chat');
      // Enviar automáticamente la pregunta rápida después de mostrarla
      setTimeout(() => {
        sendMessage(quickPrompt);
        if (onQuickPromptProcessed) {
          onQuickPromptProcessed();
        }
      }, 500);
    }
  }, [quickPrompt]);

  const sendMessage = async (messageToSend?: string) => {
    const message = messageToSend || inputMessage.trim();
    if (!message || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          conversationHistory: messages.slice(-5) // Últimos 5 mensajes para contexto
        }),
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateAnalysis = async () => {
    setIsAnalysisLoading(true);
    try {
      const response = await fetch('/api/ai/analysis');
      if (!response.ok) {
        throw new Error('Error generando análisis');
      }
      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error('Error generating analysis:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el análisis. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsAnalysisLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startConversation = () => {
    const welcomeMessage: ChatMessage = {
      role: 'assistant',
      content: '¡Hola! Soy tu asistente de inteligencia de negocios. Puedo ayudarte a analizar tus datos, responder preguntas sobre tu negocio y darte recomendaciones estratégicas. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-6 w-6 text-superset-blue" />
            <CardTitle className="text-xl font-semibold">
              Asistente IA
            </CardTitle>
            <Badge variant="secondary" className="bg-superset-blue text-white text-xs">
              Powered by Gemini
            </Badge>
          </div>
          <div className="flex space-x-2">
            <Button
              variant={activeTab === 'chat' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('chat')}
              data-testid="tab-chat"
            >
              Chat
            </Button>
            <Button
              variant={activeTab === 'analysis' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('analysis')}
              data-testid="tab-analysis"
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              Análisis
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        {activeTab === 'chat' ? (
          <>
            <ScrollArea className="flex-1 pr-4 mb-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Bot className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">¡Comienza a conversar!</h3>
                  <p className="text-muted-foreground mb-4">
                    Pregúntame sobre tus ventas, inventario, cobranzas o cualquier aspecto de tu negocio.
                  </p>
                  <Button onClick={startConversation} data-testid="button-start-chat">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Iniciar Conversación
                  </Button>
                </div>
              ) : (
                <div className="space-y-6 py-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`flex w-full max-w-[90%] ${
                          message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                        }`}
                      >
                        <div
                          className={`flex-shrink-0 ${
                            message.role === 'user' ? 'ml-3' : 'mr-3'
                          }`}
                        >
                          {message.role === 'user' ? (
                            <div className="bg-superset-blue text-white rounded-full p-2">
                              <User className="h-4 w-4" />
                            </div>
                          ) : (
                            <div className="bg-superset-blue/10 border border-superset-blue/20 rounded-full p-2">
                              <Bot className="h-4 w-4 text-superset-blue" />
                            </div>
                          )}
                        </div>
                        <div
                          className={`rounded-xl shadow-sm border flex-1 max-w-full ${
                            message.role === 'user'
                              ? 'bg-superset-blue text-white border-superset-blue'
                              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          <div className="p-4 overflow-hidden">
                            <div className={`text-sm ${message.role === 'assistant' ? 'break-words' : 'whitespace-pre-wrap break-words'} leading-relaxed`}>
                              {message.role === 'assistant' ? (
                                <FormattedMessage content={message.content} />
                              ) : (
                                message.content
                              )}
                            </div>
                          </div>
                          <div className={`px-4 pb-2 text-xs opacity-70 ${message.role === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                            {message.timestamp.toLocaleTimeString('es-ES', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex mr-2">
                        <div className="bg-gray-200 dark:bg-gray-700 rounded-full p-2">
                          <Bot className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Pensando...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>
            
            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu pregunta aquí..."
                disabled={isLoading}
                data-testid="input-chat-message"
                className="flex-1"
              />
              <Button 
                onClick={() => sendMessage()} 
                disabled={isLoading || !inputMessage.trim()}
                data-testid="button-send-message"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1">
            {!analysis ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Análisis Inteligente</h3>
                <p className="text-muted-foreground mb-4">
                  Genera un análisis completo de tu negocio con insights y recomendaciones personalizadas.
                </p>
                <Button 
                  onClick={generateAnalysis} 
                  disabled={isAnalysisLoading}
                  data-testid="button-generate-analysis"
                >
                  {isAnalysisLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generar Análisis
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Resumen Ejecutivo</h3>
                    <p className="text-muted-foreground">{analysis.summary}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Insights Clave</h3>
                    <div className="space-y-3">
                      {analysis.insights.map((insight, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{typeIcons[insight.type]}</span>
                              <h4 className="font-medium">{insight.title}</h4>
                            </div>
                            <Badge className={priorityColors[insight.priority]}>
                              {insight.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{insight.message}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Categoría: {insight.category}</span>
                            <span>Confianza: {Math.round(insight.confidence * 100)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Recomendaciones</h3>
                    <div className="space-y-2">
                      {analysis.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <span className="text-superset-blue font-semibold">{index + 1}.</span>
                          <p className="text-sm">{recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <Button 
                      onClick={generateAnalysis} 
                      variant="outline"
                      disabled={isAnalysisLoading}
                      data-testid="button-refresh-analysis"
                    >
                      {isAnalysisLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Actualizando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Actualizar Análisis
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}