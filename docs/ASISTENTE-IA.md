# Asistente de IA - SupersetBI

El Asistente de IA de SupersetBI es un consultor inteligente que proporciona insights empresariales, recomendaciones y análisis contextual basado en los datos reales de tu negocio.

## 🤖 Características Principales

### Inteligencia Contextual
- **Análisis en Tiempo Real**: Acceso directo a datos de inventario, ventas y cobranzas
- **Recomendaciones Personalizadas**: Basadas en el estado actual de tu negocio
- **Insights Predictivos**: Tendencias y proyecciones inteligentes
- **Alertas Proactivas**: Identificación automática de problemas y oportunidades

### Historial Persistente
- **Conversaciones Guardadas**: Todas las interacciones se almacenan en PostgreSQL
- **Contexto Continuo**: El asistente recuerda conversaciones anteriores
- **Optimización de Tokens**: Reduce costos al evitar repetir contexto
- **Gestión de Conversaciones**: Crear, cargar y eliminar conversaciones fácilmente

## 🎯 Casos de Uso

### 1. Análisis de Inventario
**Pregunta**: "¿Cuál es el estado actual de mi inventario?"

**Respuesta del IA**:
- Productos con stock bajo o agotados
- Análisis ABC de productos por valor
- Recomendaciones de reabastecimiento
- Alertas de productos próximos a vencer

### 2. Insights de Ventas
**Pregunta**: "¿Cómo están mis ventas este mes?"

**Respuesta del IA**:
- Comparación con meses anteriores
- Productos más vendidos
- Análisis de tendencias
- Recomendaciones de precio o promociones

### 3. Gestión de Cobranzas
**Pregunta**: "¿Qué clientes debo contactar para cobrar?"

**Respuesta del IA**:
- Listado de cuentas vencidas por prioridad
- Clientes con mayor riesgo de mora
- Estrategias de cobranza personalizadas
- Proyección de flujo de caja

### 4. Análisis Estratégico
**Pregunta**: "¿Qué mejoras puedo hacer en mi negocio?"

**Respuesta del IA**:
- Análisis FODA automatizado
- Oportunidades de crecimiento
- Optimizaciones operativas
- Benchmarks de la industria

## 🔧 Tecnología

### Modelo de IA
- **Google Gemini 2.5 Flash**: Modelo de lenguaje avanzado
- **Capacidad**: 1 millón de tokens de contexto
- **Latencia**: Respuestas en 1-3 segundos
- **Precisión**: Optimizado para análisis empresarial

### Integración de Datos
```typescript
// El asistente accede a datos en tiempo real
const businessContext = {
  products: await storage.getProducts(companyId),
  sales: await storage.getSales(companyId),
  collections: await storage.getCollections(companyId),
  alerts: await storage.getStockAlerts(companyId)
};
```

### Procesamiento Contextual
```typescript
const systemPrompt = `
Eres un consultor experto en business intelligence.
Contexto actual del negocio:
- ${products.length} productos en inventario
- ${lowStockProducts.length} productos con stock bajo
- $${totalRevenue.toFixed(2)} en ventas totales
- ${overdueCollections.length} cobros vencidos

Proporciona insights accionables y específicos.
`;
```

## 💬 Interface de Chat

### Componentes Principales

#### 1. **Panel de Conversaciones**
- Lista de conversaciones guardadas
- Fecha y número de mensajes
- Búsqueda de conversaciones
- Botón "Nueva Conversación"

#### 2. **Área de Chat**
- Mensajes del usuario y asistente
- Formato markdown avanzado
- Timestamps y estado de envío
- Indicador de escritura

#### 3. **Entrada de Mensaje**
- Input con autocompletado
- Botones de envío
- Soporte para mensajes largos
- Preguntas sugeridas

### Formato de Mensajes

El asistente usa **markdown avanzado** para estructurar respuestas:

```markdown
## 📊 Análisis de Inventario

**Productos con stock crítico:**
- Laptop Dell XPS 13: 2 unidades (mínimo: 5)
- Mouse Logitech MX3: 0 unidades (¡agotado!)

**Recomendaciones:**
1. **Reabastecer urgente**: Laptop Dell XPS 13
2. **Solicitar cotización**: Nuevos proveedores de mouse
3. **Revisar punto de reorden**: Ajustar mínimos de inventario
```

## 🗃️ Base de Datos

### Esquema de Conversaciones

```sql
-- Tabla de conversaciones
CREATE TABLE chat_conversations (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id VARCHAR NOT NULL,
  user_id VARCHAR NOT NULL,
  title TEXT NOT NULL,
  last_message_at TIMESTAMP DEFAULT NOW(),
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de mensajes
CREATE TABLE chat_messages (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id VARCHAR NOT NULL,
  role TEXT NOT NULL, -- 'user' | 'assistant'
  content TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  token_count INTEGER, -- Para tracking de costos
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Relaciones
```typescript
export const chatConversationsRelations = relations(chatConversations, ({ one, many }) => ({
  company: one(companies, {
    fields: [chatConversations.companyId],
    references: [companies.id],
  }),
  user: one(users, {
    fields: [chatConversations.userId],
    references: [users.id],
  }),
  messages: many(chatMessages),
}));
```

## 🔄 API Endpoints

### Gestión de Conversaciones

#### Obtener Conversaciones
```typescript
GET /api/chat/conversations
Response: ChatConversation[]

interface ChatConversation {
  id: string;
  title: string;
  lastMessageAt: string;
  messageCount: number;
  createdAt: string;
}
```

#### Crear Conversación
```typescript
POST /api/chat/conversations
Body: { title: string }
Response: ChatConversation
```

#### Obtener Mensajes
```typescript
GET /api/chat/conversations/:id/messages
Response: ChatMessage[]

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  tokenCount?: number;
}
```

#### Eliminar Conversación
```typescript
DELETE /api/chat/conversations/:id
Response: { success: boolean }
```

### Chat con IA

#### Enviar Mensaje
```typescript
POST /api/ai/chat
Body: {
  message: string;
  conversationId?: string;
  createNewConversation?: boolean;
}

Response: {
  response: string;
  conversationId: string;
  messageCount: number;
}
```

## 🎨 Experiencia de Usuario

### Flujo de Interacción

1. **Inicio**: Usuario abre el asistente de IA
2. **Historial**: Ve conversaciones anteriores (si las hay)
3. **Nueva Consulta**: Hace clic en "Nueva Conversación" o selecciona existente
4. **Pregunta**: Escribe su consulta o selecciona una sugerida
5. **Respuesta**: Recibe análisis contextual del asistente
6. **Seguimiento**: Puede hacer preguntas de seguimiento
7. **Guardado**: La conversación se guarda automáticamente

### Preguntas Sugeridas

```typescript
const quickPrompts = [
  "¿Cuál es el estado actual de mi inventario?",
  "¿Qué productos debería reabastecer?",
  "¿Cuáles son mis productos más vendidos?",
  "¿Cómo están mis cobros pendientes?",
  "Dame un resumen de las ventas del mes",
  "¿Qué mejoras puedo hacer en mi negocio?"
];
```

### Responsive Design

La interfaz es **completamente responsiva**:
- **Desktop**: Panel lateral con historial
- **Tablet**: Historial colapsible
- **Mobile**: Vista optimizada para touch

## ⚡ Optimización y Performance

### Gestión de Tokens
- **Historial Inteligente**: Solo últimos 10 mensajes para contexto
- **Compresión de Context**: Resumen automático de conversaciones largas
- **Cache de Respuestas**: Respuestas comunes pre-calculadas

### Optimización de Base de Datos
```sql
-- Índices para performance
CREATE INDEX chat_conversations_company_user_idx 
  ON chat_conversations(company_id, user_id);

CREATE INDEX chat_messages_conversation_timestamp_idx 
  ON chat_messages(conversation_id, timestamp);
```

### Caching Estratégico
```typescript
// Cache de contexto empresarial por 5 minutos
const businessContext = await cache.remember(
  `business-context-${companyId}`,
  300, // 5 minutos
  () => buildBusinessContext(companyId)
);
```

## 🔒 Seguridad y Privacidad

### Aislamiento Multi-Tenant
- Todas las conversaciones incluyen `companyId`
- Usuarios solo ven conversaciones de su empresa
- Datos empresariales nunca se mezclan

### Protección de Datos
- Mensajes encriptados en tránsito
- No se almacenan datos sensibles en logs
- Cumplimiento con regulaciones de privacidad

### Validación de Input
```typescript
const chatMessageSchema = z.object({
  message: z.string().min(1).max(2000),
  conversationId: z.string().uuid().optional()
});
```

## 📊 Métricas y Analytics

### Métricas de Uso
- Conversaciones por día/mes
- Mensajes promedio por conversación
- Temas más consultados
- Tiempo de respuesta promedio

### Métricas de Negocio
- Recomendaciones implementadas
- Alertas detectadas y resueltas
- Mejoras sugeridas aplicadas
- ROI del asistente de IA

### Dashboard de IA
```typescript
const aiMetrics = {
  totalConversations: 1248,
  averageMessagesPerConversation: 4.2,
  topTopics: ['inventory', 'sales', 'collections'],
  responseTime: '2.1s',
  userSatisfaction: 4.7 // /5.0
};
```

## 🚀 Futuras Mejoras

### Características Planificadas
- **Análisis de Documentos**: Upload de PDFs para análisis
- **Reportes Automáticos**: Generación de reportes periódicos
- **Integración con WhatsApp**: Notificaciones por WhatsApp
- **Modo Voz**: Interacción por voz
- **Análisis de Imágenes**: Reconocimiento de productos

### Expansión de IA
- **Modelos Especializados**: IA específica por industria
- **Aprendizaje Continuo**: Mejora basada en uso
- **Predicciones Avanzadas**: ML para forecasting
- **Automatización**: Acciones automáticas basadas en IA

---

El Asistente de IA es el **corazón inteligente** de SupersetBI, transformando datos en insights accionables para impulsar el crecimiento de tu negocio. 🚀