# Base de Datos - SupersetBI

SupersetBI utiliza **PostgreSQL** como base de datos principal con **Drizzle ORM** para garantizar type safety y performance. Este documento detalla el esquema completo, relaciones y mejores prácticas.

## 🗄️ Tecnologías

- **PostgreSQL 15+**: Base de datos principal
- **Neon Database**: Plataforma serverless (producción)
- **Drizzle ORM**: ORM type-safe para TypeScript
- **Drizzle Kit**: Herramientas de migración y gestión

## 🏗️ Arquitectura Multi-Tenant

Todas las tablas implementan **aislamiento por empresa** usando `company_id`:

```sql
-- Patrón estándar multi-tenant
CREATE TABLE ejemplo (
  id VARCHAR PRIMARY KEY,
  company_id VARCHAR NOT NULL,  -- 🔑 Clave multi-tenant
  -- ... otros campos
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índice obligatorio para performance
CREATE INDEX ejemplo_company_idx ON ejemplo(company_id);
```

## 📊 Esquema Principal

### 1. Gestión de Empresas y Usuarios

#### Companies (Empresas)
```sql
CREATE TABLE companies (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug VARCHAR NOT NULL UNIQUE,
  email VARCHAR,
  phone VARCHAR,
  address TEXT,
  subscription_type VARCHAR DEFAULT 'basic',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Company Invitations (Invitaciones)
```sql
CREATE TABLE company_invitations (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  role VARCHAR NOT NULL DEFAULT 'user',
  token VARCHAR NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  accepted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Users (Usuarios)
```sql
CREATE TABLE users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id VARCHAR NOT NULL,
  username VARCHAR NOT NULL UNIQUE,
  email VARCHAR,
  full_name TEXT,
  role VARCHAR NOT NULL DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Módulo de Inventario

#### Categories (Categorías)
```sql
CREATE TABLE categories (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id VARCHAR NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Suppliers (Proveedores)
```sql
CREATE TABLE suppliers (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id VARCHAR NOT NULL,
  name TEXT NOT NULL,
  contact_name TEXT,
  email VARCHAR,
  phone VARCHAR,
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Warehouses (Almacenes)
```sql
CREATE TABLE warehouses (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id VARCHAR NOT NULL,
  name TEXT NOT NULL,
  location TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Products (Productos)
```sql
CREATE TABLE products (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id VARCHAR NOT NULL,
  name TEXT NOT NULL,
  sku VARCHAR,
  category_id VARCHAR,
  supplier_id VARCHAR,
  warehouse_id VARCHAR,
  description TEXT,
  price DECIMAL NOT NULL,
  cost DECIMAL,
  stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 0,
  max_stock INTEGER,
  unit VARCHAR DEFAULT 'unit',
  barcode VARCHAR,
  expiry_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Inventory Movements (Movimientos de Inventario)
```sql
CREATE TABLE inventory_movements (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id VARCHAR NOT NULL,
  product_id VARCHAR NOT NULL,
  movement_type VARCHAR NOT NULL, -- 'in', 'out', 'adjustment'
  quantity INTEGER NOT NULL,
  unit_cost DECIMAL,
  total_cost DECIMAL,
  reference VARCHAR,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Stock Alerts (Alertas de Stock)
```sql
CREATE TABLE stock_alerts (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id VARCHAR NOT NULL,
  product_id VARCHAR NOT NULL,
  alert_type VARCHAR NOT NULL, -- 'low_stock', 'out_of_stock', 'expiring'
  priority VARCHAR NOT NULL, -- 'low', 'medium', 'high', 'critical'
  message TEXT NOT NULL,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Módulo de Ventas

#### Customers (Clientes)
```sql
CREATE TABLE customers (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id VARCHAR NOT NULL,
  name TEXT NOT NULL,
  email VARCHAR,
  phone VARCHAR,
  address TEXT,
  tax_id VARCHAR,
  credit_limit DECIMAL DEFAULT 0,
  current_balance DECIMAL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Salespeople (Vendedores)
```sql
CREATE TABLE salespeople (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id VARCHAR NOT NULL,
  name TEXT NOT NULL,
  email VARCHAR,
  phone VARCHAR,
  commission_rate DECIMAL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Enhanced Sales (Ventas Avanzadas)
```sql
CREATE TABLE enhanced_sales (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id VARCHAR NOT NULL,
  customer_id VARCHAR NOT NULL,
  salesperson_id VARCHAR,
  sale_date DATE NOT NULL,
  subtotal DECIMAL NOT NULL,
  tax_amount DECIMAL DEFAULT 0,
  discount_amount DECIMAL DEFAULT 0,
  total_amount DECIMAL NOT NULL,
  payment_method VARCHAR,
  payment_status VARCHAR DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Sale Items (Items de Venta)
```sql
CREATE TABLE sale_items (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id VARCHAR NOT NULL,
  sale_id VARCHAR NOT NULL,
  product_id VARCHAR NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL NOT NULL,
  discount DECIMAL DEFAULT 0,
  tax_rate DECIMAL DEFAULT 0,
  total DECIMAL NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4. Módulo de Cobranzas

#### Accounts Receivable (Cuentas por Cobrar)
```sql
CREATE TABLE accounts_receivable (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id VARCHAR NOT NULL,
  customer_id VARCHAR NOT NULL,
  invoice_number VARCHAR,
  amount DECIMAL NOT NULL,
  outstanding_amount DECIMAL NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Payments (Pagos)
```sql
CREATE TABLE payments (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id VARCHAR NOT NULL,
  customer_id VARCHAR NOT NULL,
  account_receivable_id VARCHAR,
  amount DECIMAL NOT NULL,
  payment_date DATE NOT NULL,
  payment_method VARCHAR,
  reference VARCHAR,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Collection Activities (Actividades de Cobranza)
```sql
CREATE TABLE collection_activities (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id VARCHAR NOT NULL,
  customer_id VARCHAR NOT NULL,
  account_receivable_id VARCHAR,
  activity_type VARCHAR NOT NULL,
  description TEXT NOT NULL,
  scheduled_date DATE,
  completed_date DATE,
  result VARCHAR,
  next_action TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 5. Sistema de IA y Chat

#### Chat Conversations (Conversaciones de Chat)
```sql
CREATE TABLE chat_conversations (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id VARCHAR NOT NULL,
  user_id VARCHAR NOT NULL,
  title TEXT NOT NULL,
  last_message_at TIMESTAMP DEFAULT NOW(),
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Chat Messages (Mensajes de Chat)
```sql
CREATE TABLE chat_messages (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id VARCHAR NOT NULL,
  role TEXT NOT NULL, -- 'user' | 'assistant'
  content TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  token_count INTEGER, -- Para tracking de consumo
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 6. Sistema de Importación

#### Data Imports (Importaciones de Datos)
```sql
CREATE TABLE data_imports (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id VARCHAR NOT NULL,
  data_type VARCHAR NOT NULL, -- 'products', 'sales', 'customers'
  filename VARCHAR NOT NULL,
  total_records INTEGER,
  processed_records INTEGER DEFAULT 0,
  successful_records INTEGER DEFAULT 0,
  failed_records INTEGER DEFAULT 0,
  status VARCHAR DEFAULT 'pending',
  error_log TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔗 Relaciones Clave

### Definición en Drizzle
```typescript
// Relaciones de productos
export const productsRelations = relations(products, ({ one, many }) => ({
  company: one(companies, {
    fields: [products.companyId],
    references: [companies.id],
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  supplier: one(suppliers, {
    fields: [products.supplierId],
    references: [suppliers.id],
  }),
  warehouse: one(warehouses, {
    fields: [products.warehouseId],
    references: [warehouses.id],
  }),
  movements: many(inventoryMovements),
  alerts: many(stockAlerts),
}));

// Relaciones de conversaciones de chat
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

## 📈 Índices de Performance

### Índices Multi-Tenant (Obligatorios)
```sql
-- Índices principales para cada tabla
CREATE INDEX products_company_idx ON products(company_id);
CREATE INDEX sales_company_idx ON enhanced_sales(company_id);
CREATE INDEX customers_company_idx ON customers(company_id);
CREATE INDEX chat_conversations_company_user_idx ON chat_conversations(company_id, user_id);
```

### Índices de Búsqueda
```sql
-- Búsquedas por texto
CREATE INDEX products_name_idx ON products(name);
CREATE INDEX customers_name_idx ON customers(name);
CREATE INDEX products_sku_idx ON products(sku);

-- Búsquedas por fecha
CREATE INDEX sales_date_idx ON enhanced_sales(sale_date);
CREATE INDEX payments_date_idx ON payments(payment_date);
CREATE INDEX chat_messages_timestamp_idx ON chat_messages(timestamp);
```

### Índices Compuestos
```sql
-- Para queries complejas
CREATE INDEX inventory_movements_product_date_idx ON inventory_movements(product_id, created_at);
CREATE INDEX stock_alerts_company_resolved_idx ON stock_alerts(company_id, is_resolved);
CREATE INDEX accounts_receivable_status_due_idx ON accounts_receivable(status, due_date);
```

## 🎯 Queries Optimizadas

### Ejemplo: Dashboard KPIs
```typescript
// Query eficiente para métricas del dashboard
export async function getDashboardMetrics(companyId: string) {
  const [products, sales, collections] = await Promise.all([
    // Productos con agregaciones
    db.select({
      total: sql<number>`count(*)`,
      lowStock: sql<number>`count(*) filter (where stock <= min_stock)`,
      outOfStock: sql<number>`count(*) filter (where stock = 0)`,
      totalValue: sql<number>`sum(price * stock)`
    })
    .from(productsTable)
    .where(eq(productsTable.companyId, companyId)),
    
    // Ventas del mes
    db.select({
      total: sql<number>`count(*)`,
      revenue: sql<number>`sum(total_amount)`
    })
    .from(enhancedSales)
    .where(
      and(
        eq(enhancedSales.companyId, companyId),
        gte(enhancedSales.saleDate, startOfMonth)
      )
    ),
    
    // Cuentas pendientes
    db.select({
      pending: sql<number>`count(*)`,
      amount: sql<number>`sum(outstanding_amount)`
    })
    .from(accountsReceivable)
    .where(
      and(
        eq(accountsReceivable.companyId, companyId),
        eq(accountsReceivable.status, 'pending')
      )
    )
  ]);
  
  return { products, sales, collections };
}
```

### Ejemplo: Chat con Contexto
```typescript
// Query eficiente para contexto de IA
export async function getAIContext(companyId: string) {
  const [businessSummary] = await db.select({
    totalProducts: sql<number>`(
      SELECT count(*) FROM products 
      WHERE company_id = ${companyId}
    )`,
    lowStockProducts: sql<number>`(
      SELECT count(*) FROM products 
      WHERE company_id = ${companyId} AND stock <= min_stock
    )`,
    totalRevenue: sql<number>`(
      SELECT COALESCE(sum(total_amount), 0) FROM enhanced_sales 
      WHERE company_id = ${companyId}
    )`,
    pendingCollections: sql<number>`(
      SELECT count(*) FROM accounts_receivable 
      WHERE company_id = ${companyId} AND status = 'pending'
    )`
  });
  
  return businessSummary;
}
```

## 🔄 Migraciones

### Configuración Drizzle
```typescript
// drizzle.config.ts
export default {
  schema: "./shared/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config;
```

### Comandos de Migración
```bash
# Generar migración
npm run db:generate

# Aplicar migraciones
npm run db:push

# Aplicar forzado (desarrollo)
npm run db:push --force

# Studio de base de datos
npm run db:studio
```

### Ejemplo de Migración
```sql
-- 0001_add_chat_system.sql
CREATE TABLE chat_conversations (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id VARCHAR NOT NULL,
  user_id VARCHAR NOT NULL,
  title TEXT NOT NULL,
  last_message_at TIMESTAMP DEFAULT NOW(),
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX chat_conversations_company_user_idx 
  ON chat_conversations(company_id, user_id);
```

## 🔒 Seguridad de Datos

### Row Level Security (RLS)
```sql
-- Habilitar RLS para productos
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Política para acceso multi-tenant
CREATE POLICY products_company_policy ON products
  FOR ALL TO authenticated
  USING (company_id = current_setting('app.company_id'));
```

### Validación de Entrada
```typescript
// Schemas Zod para validación
export const insertProductSchema = createInsertSchema(products, {
  name: z.string().min(1).max(100),
  price: z.number().positive(),
  stock: z.number().int().min(0),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages, {
  content: z.string().min(1).max(2000),
  role: z.enum(['user', 'assistant']),
});
```

## 📊 Monitoreo y Mantenimiento

### Queries Lentas
```sql
-- Identificar queries lentas
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
```

### Estadísticas de Tablas
```sql
-- Tamaño de tablas
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE tablename IN ('products', 'enhanced_sales', 'chat_messages')
ORDER BY n_distinct DESC;
```

### Mantenimiento Automático
```sql
-- Vacuum automático
ALTER TABLE chat_messages SET (
  autovacuum_enabled = true,
  autovacuum_vacuum_scale_factor = 0.1,
  autovacuum_analyze_scale_factor = 0.05
);
```

## 🚀 Escalabilidad

### Particionado (Futuro)
```sql
-- Particionado por fecha para mensajes
CREATE TABLE chat_messages_2024_01 PARTITION OF chat_messages
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

### Read Replicas
```typescript
// Configuración de lectura/escritura
const writeDb = drizzle(writePool, { schema });
const readDb = drizzle(readPool, { schema });

// Usar read replica para consultas
const products = await readDb.select().from(productsTable);
```

---

Esta arquitectura de base de datos está diseñada para ser **escalable**, **segura** y **performante**, proporcionando la base sólida que SupersetBI necesita para crecer. 🚀