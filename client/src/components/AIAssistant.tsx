import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bot, User, Send, Sparkles, BarChart3, Loader2, History, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ChatMessage {
  id?: string;
  conversationId?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tokenCount?: number;
}

interface ChatConversation {
  id: string;
  title: string;
  lastMessageAt: string;
  messageCount: number;
  createdAt: string;
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

// Componente para formatear mensajes del asistente con diseño profesional
const FormattedMessage = ({ content }: { content: string }) => {
  // Función para procesar texto con markdown avanzado
  const processAdvancedMarkdown = (text: string) => {
    // Procesar texto en negrita **texto**
    let processedText = text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        return (
          <strong key={`bold-${index}`} className="font-semibold text-gray-900 dark:text-gray-100 bg-blue-50 dark:bg-blue-950 px-1 rounded">
            {boldText}
          </strong>
        );
      }
      return <span key={`text-${index}`}>{part}</span>;
    });
    
    return processedText;
  };

  // Función para formatear el texto con estructura avanzada
  const formatAdvancedText = (text: string) => {
    // Dividir en secciones por doble salto de línea
    const sections = text.split('\n\n');
    
    return sections.map((section, sectionIndex) => {
      const trimmedSection = section.trim();
      if (!trimmedSection) return null;
      
      // Detectar encabezados principales (###)
      if (trimmedSection.startsWith('###')) {
        return (
          <div key={`header-${sectionIndex}`} className="mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-superset-blue flex items-center gap-2">
              <span className="w-1 h-6 bg-superset-blue rounded-full"></span>
              {trimmedSection.replace(/^###\s*/, '')}
            </h3>
          </div>
        );
      }
      
      // Detectar listas avanzadas con mejor formato
      if (trimmedSection.includes('\n*') || trimmedSection.includes('\n-') || trimmedSection.includes('\n•') || /\n\d+\./.test(trimmedSection)) {
        const lines = trimmedSection.split('\n');
        const title = lines[0];
        const listItems = lines.slice(1).filter(line => line.trim());
        
        return (
          <div key={`list-${sectionIndex}`} className="mb-6">
            {title && !title.match(/^[-*•\d]/) && (
              <div className="font-semibold mb-3 text-gray-800 dark:text-gray-200 text-base border-l-4 border-superset-blue pl-3 bg-gray-50 dark:bg-gray-800 py-2 rounded-r">
                {processAdvancedMarkdown(title)}
              </div>
            )}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <ul className="space-y-3">
                {listItems.map((item, itemIndex) => {
                  const cleanItem = item.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '').trim();
                  if (!cleanItem) return null;
                  
                  // Detectar si el item tiene dos puntos (es un subtítulo)
                  const hasSubtitle = cleanItem.includes(':');
                  if (hasSubtitle) {
                    const [subtitle, ...rest] = cleanItem.split(':');
                    const description = rest.join(':').trim();
                    return (
                      <li key={itemIndex} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors">
                        <div className="w-2 h-2 bg-superset-blue rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                            {processAdvancedMarkdown(subtitle.trim())}
                          </div>
                          {description && (
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                              {processAdvancedMarkdown(description)}
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  }
                  
                  return (
                    <li key={itemIndex} className="flex items-start space-x-3 text-sm">
                      <div className="w-2 h-2 bg-superset-blue rounded-full mt-2 flex-shrink-0"></div>
                      <div className="text-gray-700 dark:text-gray-300 leading-relaxed flex-1 min-w-0">
                        {processAdvancedMarkdown(cleanItem)}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        );
      }
      
      // Detectar preguntas destacadas
      if (trimmedSection.length < 120 && trimmedSection.endsWith('?')) {
        return (
          <div key={`question-${sectionIndex}`} className="mb-4 p-3 bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500 rounded-r-lg">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 flex items-center gap-2">
              <span className="text-blue-500">🤔</span>
              {processAdvancedMarkdown(trimmedSection)}
            </h4>
          </div>
        );
      }
      
      // Detectar títulos importantes (que terminan en :)
      if (trimmedSection.length < 100 && trimmedSection.endsWith(':')) {
        return (
          <div key={`title-${sectionIndex}`} className="mb-3">
            <h4 className="font-semibold text-lg text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">
              {processAdvancedMarkdown(trimmedSection)}
            </h4>
          </div>
        );
      }
      
      // Párrafo normal con mejor estilo
      return (
        <div key={`paragraph-${sectionIndex}`} className="mb-4 p-3 leading-relaxed text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded-lg break-words">
          <div className="overflow-wrap-anywhere word-break-break-word max-w-full">
            {processAdvancedMarkdown(trimmedSection)}
          </div>
        </div>
      );
    }).filter(Boolean);
  };
  
  return (
    <div className="space-y-4 max-w-full overflow-hidden">
      <div className="prose prose-sm max-w-none dark:prose-invert break-words">
        <div className="overflow-wrap-anywhere word-break-break-word">
          {formatAdvancedText(content)}
        </div>
      </div>
    </div>
  );
};

export default function AIAssistant({ quickPrompt, onQuickPromptProcessed }: AIAssistantProps = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<BusinessAnalysis | null>(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'analysis'>('chat');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showConversationHistory, setShowConversationHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener conversaciones
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ['/api/chat/conversations'],
    queryFn: () => fetch('/api/chat/conversations').then(res => res.json()),
  });

  // Cargar mensajes de conversación seleccionada
  useEffect(() => {
    if (selectedConversationId) {
      fetch(`/api/chat/conversations/${selectedConversationId}/messages`)
        .then(res => res.json())
        .then(data => {
          const formattedMessages = data.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          setMessages(formattedMessages);
        })
        .catch(error => {
          console.error('Error loading messages:', error);
          toast({
            title: "Error",
            description: "No se pudieron cargar los mensajes.",
            variant: "destructive",
          });
        });
    }
  }, [selectedConversationId]);

  // Crear nueva conversación
  const createConversationMutation = useMutation({
    mutationFn: async (title: string) => {
      const response = await apiRequest('POST', '/api/chat/conversations', { title });
      return response.json();
    },
    onSuccess: (newConversation) => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/conversations'] });
      setSelectedConversationId(newConversation.id);
      setMessages([]);
      toast({
        title: "Nueva conversación creada",
        description: "Puedes comenzar a chatear ahora.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear la conversación.",
        variant: "destructive",
      });
    }
  });

  // Eliminar conversación
  const deleteConversationMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      const response = await apiRequest('DELETE', `/api/chat/conversations/${conversationId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/conversations'] });
      if (selectedConversationId) {
        setSelectedConversationId(null);
        setMessages([]);
      }
      toast({
        title: "Conversación eliminada",
        description: "La conversación se eliminó correctamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la conversación.",
        variant: "destructive",
      });
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Procesar preguntas rápidas
  useEffect(() => {
    if (quickPrompt && quickPrompt.trim()) {
      console.log('Processing quick prompt:', quickPrompt);
      setInputMessage(quickPrompt);
      setActiveTab('chat');
      // Enviar automáticamente la pregunta rápida después de mostrarla
      setTimeout(() => {
        sendMessage(quickPrompt);
        // Solo limpiar el input después de un delay adicional
        setTimeout(() => {
          if (onQuickPromptProcessed) {
            onQuickPromptProcessed();
          }
        }, 500);
      }, 1500); // Más tiempo para ver la pregunta
    }
  }, [quickPrompt]);

  const sendMessage = async (messageToSend?: string) => {
    const message = messageToSend || inputMessage.trim();
    if (!message || isLoading) return;

    // Si no hay conversación seleccionada, crear una nueva
    if (!selectedConversationId) {
      const title = message.length > 50 ? message.substring(0, 50) + '...' : message;
      createConversationMutation.mutate(title);
      // El mensaje se enviará cuando la conversación se cree
      return;
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    if (!messageToSend) {
      setInputMessage('');
    }
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          conversationId: selectedConversationId
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
      
      // Actualizar la lista de conversaciones
      queryClient.invalidateQueries({ queryKey: ['/api/chat/conversations'] });
      
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
    createConversationMutation.mutate('Nueva consulta');
  };
  
  const loadConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setShowConversationHistory(false);
  };
  
  const deleteConversation = (conversationId: string) => {
    deleteConversationMutation.mutate(conversationId);
  };
  
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace unos minutos';
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    if (diffInHours < 168) return `Hace ${Math.floor(diffInHours / 24)} días`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
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
              variant="outline"
              size="sm"
              onClick={() => setShowConversationHistory(!showConversationHistory)}
              data-testid="toggle-history"
            >
              <History className="h-4 w-4 mr-1" />
              Historial
            </Button>
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
        
        {/* Panel de Historial de Conversaciones */}
        {showConversationHistory && (
          <div className="mt-4 border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-sm">Conversaciones ({conversations.length})</h4>
              <Button 
                size="sm" 
                onClick={startConversation}
                disabled={createConversationMutation.isPending}
              >
                <Plus className="h-3 w-3 mr-1" />
                Nueva
              </Button>
            </div>
            <ScrollArea className="h-32">
              <div className="space-y-1">
                {conversations.map((conversation: ChatConversation) => (
                  <div 
                    key={conversation.id} 
                    className={`flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                      selectedConversationId === conversation.id ? 'bg-superset-blue/10 border border-superset-blue/20' : ''
                    }`}
                    onClick={() => loadConversation(conversation.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{conversation.title}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>{formatRelativeTime(conversation.lastMessageAt)}</span>
                        <span>•</span>
                        <span>{conversation.messageCount} mensajes</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conversation.id);
                      }}
                      disabled={deleteConversationMutation.isPending}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {conversations.length === 0 && (
                  <div className="text-center text-sm text-muted-foreground py-4">
                    No hay conversaciones guardadas
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        {activeTab === 'chat' ? (
          <>
            <ScrollArea className="flex-1 pr-4 mb-4 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-900/50 dark:to-gray-900 rounded-lg">
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
                <div className="space-y-8 py-6 px-2">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`flex max-w-[80%] ${
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
                          className={`rounded-xl shadow-lg border-2 min-w-0 flex-1 transition-all hover:shadow-xl ${
                            message.role === 'user'
                              ? 'bg-gradient-to-br from-superset-blue to-blue-600 text-white border-superset-blue transform hover:scale-[1.02]'
                              : 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          {message.role === 'assistant' && (
                            <div className="bg-gradient-to-r from-superset-blue/10 to-blue-500/10 px-4 py-2 rounded-t-xl border-b border-gray-200 dark:border-gray-700">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-xs font-medium text-superset-blue dark:text-blue-400">Asistente IA</span>
                                <span className="text-xs text-gray-500">• Powered by Gemini</span>
                              </div>
                            </div>
                          )}
                          <div className="p-5 max-w-full overflow-hidden">
                            <div className={`leading-relaxed max-w-full break-words overflow-wrap-anywhere ${
                              message.role === 'assistant' ? 'text-sm' : 'text-sm whitespace-pre-wrap font-medium'
                            }`}>
                              {message.role === 'assistant' ? (
                                <div className="max-w-full overflow-hidden">
                                  <FormattedMessage content={message.content} />
                                </div>
                              ) : (
                                <div className="flex items-start gap-2 max-w-full">
                                  <span className="text-blue-200 flex-shrink-0">💬</span>
                                  <span className="break-words overflow-wrap-anywhere min-w-0 flex-1">{message.content}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className={`px-5 pb-3 text-xs flex items-center justify-between opacity-70 ${
                            message.role === 'user' ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            <span>
                              {message.timestamp.toLocaleTimeString('es-ES', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                            {message.role === 'assistant' && (
                              <div className="flex items-center gap-1">
                                <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                                <span>Respuesta generada</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex mr-3">
                        <div className="bg-superset-blue/20 border-2 border-superset-blue/30 rounded-full p-2 animate-pulse">
                          <Bot className="h-4 w-4 text-superset-blue" />
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg p-4 border-2 border-gray-300 dark:border-gray-600">
                        <div className="flex items-center space-x-3">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-superset-blue rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-superset-blue rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-superset-blue rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Analizando datos y generando respuesta...</span>
                        </div>
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          Procesando información de tu negocio con IA
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