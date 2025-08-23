# Arquitectura del Sistema - SupersetBI

Este documento describe la arquitectura técnica completa de SupersetBI, incluyendo componentes, tecnologías y patrones de diseño.

## 🏗️ Visión General de la Arquitectura

SupersetBI utiliza una arquitectura **full-stack moderna** con separación clara de responsabilidades:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   React/Vite    │◄──►│   Express.js    │◄──►│   PostgreSQL    │
│                 │    │                 │    │   (Neon)        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                     ┌─────────────────┐
                     │   External AI   │
                     │   Google Gemini │
                     └─────────────────┘
```

## 🎯 Principios de Diseño

### 1. **Separación de Responsabilidades**
- **Frontend**: UI/UX y gestión de estado del cliente
- **Backend**: Lógica de negocio, APIs y procesamiento de datos
- **Database**: Persistencia y gestión de datos
- **AI Service**: Procesamiento de inteligencia artificial

### 2. **Multi-Tenant por Diseño**
- Todos los datos están aislados por `companyId`
- Seguridad a nivel de base de datos
- APIs conscientes del contexto de empresa

### 3. **Type Safety First**
- TypeScript en todo el stack
- Tipos compartidos entre frontend y backend
- Validación en tiempo de ejecución con Zod

### 4. **Real-time & Reactive**
- TanStack Query para sincronización de estado
- Actualizaciones automáticas de datos
- UI reactiva con hooks personalizados

## 🖥️ Arquitectura Frontend

### Estructura de Componentes

```
client/src/
├── components/
│   ├── ui/                 # Componentes base (shadcn/ui)
│   ├── layout/             # Layout y navegación
│   ├── forms/              # Formularios reutilizables
│   ├── charts/             # Componentes de visualización
│   ├── inventory/          # Módulo de inventario
│   ├── sales/              # Módulo de ventas
│   ├── collections/        # Módulo de cobranzas
│   └── AIAssistant.tsx     # Asistente de IA
├── pages/                  # Páginas principales
├── hooks/                  # Custom hooks
├── lib/                    # Utilidades y configuración
└── types/                  # Tipos TypeScript locales
```

### Tecnologías Frontend

| Tecnología | Propósito | Justificación |
|------------|-----------|---------------|
| **React 18** | Framework principal | Ecosistema maduro, performance |
| **TypeScript** | Type safety | Reducir errores, mejor DX |
| **Vite** | Build tool | Hot reload rápido, ESM nativo |
| **shadcn/ui** | Componentes UI | Accesible, personalizable |
| **Tailwind CSS** | Styling | Utility-first, consistencia |
| **TanStack Query** | Estado del servidor | Cache inteligente, sincronización |
| **Wouter** | Routing | Ligero, simple |
| **Recharts** | Visualización | Integración React, flexibilidad |

### Patrones de Componentes

#### 1. **Compound Components**
```typescript
<Card>
  <CardHeader>
    <CardTitle>Inventario</CardTitle>
  </CardHeader>
  <CardContent>
    <InventoryKPIs />
  </CardContent>
</Card>
```

#### 2. **Custom Hooks**
```typescript
// hooks/use-business-data.ts
export function useBusinessData(companyId: string) {
  const { data: inventory } = useQuery({
    queryKey: ['inventory', companyId],
    queryFn: () => fetchInventory(companyId)
  });
  
  return { inventory, isLoading };
}
```

#### 3. **Error Boundaries**
```typescript
<ErrorBoundary fallback={<ErrorPage />}>
  <InventoryModule />
</ErrorBoundary>
```

## ⚙️ Arquitectura Backend

### Estructura de Servicios

```
server/
├── routes.ts              # Rutas principales de API
├── storage.ts             # Capa de acceso a datos
├── ai-service.ts          # Servicio de inteligencia artificial
├── db.ts                  # Configuración de base de datos
├── middleware/            # Middleware personalizado
├── utils/                 # Utilidades del servidor
└── types/                 # Tipos específicos del servidor
```

### Tecnologías Backend

| Tecnología | Propósito | Justificación |
|------------|-----------|---------------|
| **Express.js** | Framework web | Maduro, flexible, ecosistema |
| **TypeScript** | Type safety | Consistencia con frontend |
| **Drizzle ORM** | Database ORM | Type-safe, performance |
| **Zod** | Validación | Runtime type checking |
| **Connect-pg-simple** | Sesiones | PostgreSQL integration |

### Capas de la Aplicación

#### 1. **API Layer (Routes)**
```typescript
app.get('/api/inventory/:companyId', async (req, res) => {
  const { companyId } = req.params;
  const inventory = await storage.getProducts(companyId);
  res.json(inventory);
});
```

#### 2. **Business Logic Layer (Storage)**
```typescript
class DatabaseStorage implements IStorage {
  async getProducts(companyId: string): Promise<Product[]> {
    return await db.select()
      .from(products)
      .where(eq(products.companyId, companyId));
  }
}
```

#### 3. **Data Access Layer (Database)**
```typescript
export const products = pgTable("products", {
  id: varchar("id").primaryKey(),
  companyId: varchar("company_id").notNull(),
  name: text("name").notNull(),
  // ...
});
```

### Patrones de Arquitectura

#### 1. **Repository Pattern**
```typescript
interface IStorage {
  getProducts(companyId: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, updates: Partial<Product>): Promise<Product>;
}
```

#### 2. **Service Layer**
```typescript
class AIService {
  async analyzeBusinessData(companyId: string): Promise<BusinessAnalysis> {
    const data = await this.gatherBusinessData(companyId);
    return await this.generateAnalysis(data);
  }
}
```

#### 3. **Middleware Chain**
```typescript
app.use(cors());
app.use(express.json());
app.use(session(sessionConfig));
app.use(authMiddleware);
app.use('/api', apiRoutes);
```

## 🗄️ Arquitectura de Base de Datos

### Diseño Multi-Tenant

Todos los datos están aislados por `companyId`:

```sql
-- Ejemplo: Tabla de productos
CREATE TABLE products (
  id VARCHAR PRIMARY KEY,
  company_id VARCHAR NOT NULL,  -- 🔑 Multi-tenant key
  name TEXT NOT NULL,
  price DECIMAL,
  stock INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índice para performance multi-tenant
CREATE INDEX products_company_idx ON products(company_id);
```

### Esquema Principal

#### Entidades de Negocio
- `companies` - Empresas (tenants)
- `users` - Usuarios del sistema
- `products` - Productos de inventario
- `sales` - Transacciones de ventas
- `collections` - Cuentas por cobrar
- `customers` - Clientes
- `suppliers` - Proveedores

#### Sistema de IA
- `chat_conversations` - Conversaciones de chat
- `chat_messages` - Mensajes individuales

#### Relaciones Clave
```typescript
export const chatConversationsRelations = relations(chatConversations, ({ one, many }) => ({
  company: one(companies, {
    fields: [chatConversations.companyId],
    references: [companies.id],
  }),
  messages: many(chatMessages),
}));
```

## 🤖 Arquitectura de IA

### Componentes del Sistema de IA

#### 1. **AI Service Layer**
```typescript
class AIService {
  private ai: GoogleGenAI;
  
  async chatWithAssistant(
    message: string, 
    companyId: string, 
    history: ChatMessage[]
  ): Promise<string> {
    const context = await this.buildBusinessContext(companyId);
    return await this.generateResponse(message, context, history);
  }
}
```

#### 2. **Context Builder**
```typescript
async buildBusinessContext(companyId: string) {
  const [products, sales, collections] = await Promise.all([
    storage.getProducts(companyId),
    storage.getSales(companyId),
    storage.getCollections(companyId)
  ]);
  
  return {
    totalProducts: products.length,
    totalRevenue: calculateRevenue(sales),
    pendingCollections: filterPending(collections),
    // ... más contexto
  };
}
```

#### 3. **Conversation Management**
```typescript
interface ChatConversation {
  id: string;
  companyId: string;
  userId: string;
  title: string;
  messageCount: number;
  lastMessageAt: Date;
}
```

### Flujo de Procesamiento de IA

```
1. Usuario envía mensaje
       ↓
2. Cargar historial de conversación
       ↓
3. Construir contexto empresarial
       ↓
4. Enviar a Google Gemini
       ↓
5. Procesar respuesta
       ↓
6. Guardar en base de datos
       ↓
7. Retornar al usuario
```

## 🔄 Flujo de Datos

### Request Flow Típico

```
1. Usuario interactúa en UI (React)
       ↓
2. Componente llama hook personalizado
       ↓
3. Hook usa TanStack Query
       ↓
4. Query hace fetch a API endpoint
       ↓
5. Express route procesa request
       ↓
6. Storage layer accede a PostgreSQL
       ↓
7. Datos regresan por la cadena
       ↓
8. UI se actualiza automáticamente
```

### Real-time Updates

```typescript
// Auto-refresh cada 30 segundos
const { data: inventory } = useQuery({
  queryKey: ['inventory', companyId],
  queryFn: () => fetchInventory(companyId),
  refetchInterval: 30000,
  staleTime: 10000
});
```

## 🛡️ Seguridad

### Autenticación y Autorización

#### 1. **Session Management**
```typescript
const sessionConfig = {
  store: new (connectPgSimple(session))({
    pool: pgPool,
    tableName: 'session'
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
};
```

#### 2. **Multi-tenant Security**
```typescript
// Middleware que inyecta companyId
app.use((req, res, next) => {
  req.companyId = req.user?.companyId;
  next();
});

// Todas las queries incluyen companyId
const products = await db.select()
  .from(productsTable)
  .where(eq(productsTable.companyId, req.companyId));
```

#### 3. **Input Validation**
```typescript
const createProductSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().positive(),
  stock: z.number().int().min(0)
});

app.post('/api/products', async (req, res) => {
  const data = createProductSchema.parse(req.body);
  // ... procesar datos validados
});
```

## 📊 Performance

### Frontend Optimization
- **Code Splitting**: Lazy loading de rutas
- **Memoization**: React.memo para componentes pesados
- **Virtual Scrolling**: Para listas grandes
- **Image Optimization**: Lazy loading de imágenes

### Backend Optimization
- **Database Indexing**: Índices en campos críticos
- **Query Optimization**: Consultas eficientes con Drizzle
- **Caching**: En memoria para datos frecuentes
- **Connection Pooling**: Pool de conexiones DB

### AI Optimization
- **Token Management**: Historial inteligente
- **Context Optimization**: Solo datos relevantes
- **Response Caching**: Cache de respuestas comunes
- **Batch Processing**: Múltiples queries en paralelo

## 🔧 Deployment Architecture

### Development Environment
```
Developer Machine
├── Vite Dev Server (Frontend)
├── Express Server (Backend) 
└── Local PostgreSQL / Neon Cloud
```

### Production Environment
```
Production Server
├── Static Files (Frontend build)
├── Node.js Process (Backend)
├── PostgreSQL Database (Neon)
└── Process Manager (PM2)
```

## 📈 Escalabilidad

### Horizontal Scaling
- **Load Balancer**: Para múltiples instancias
- **Database Sharding**: Por companyId
- **CDN**: Para assets estáticos
- **Microservices**: Separar IA service

### Vertical Scaling
- **Database**: Upgrade de recursos
- **Server**: Más CPU/RAM
- **Caching**: Redis para hot data

## 🔍 Monitoring y Logging

### Application Metrics
- Request latency
- Error rates
- Database query performance
- AI response times

### Business Metrics
- Active companies
- Daily active users
- AI queries per day
- Feature usage analytics

---

Esta arquitectura está diseñada para ser **escalable**, **mantenible** y **segura**, proporcionando una base sólida para el crecimiento de SupersetBI.