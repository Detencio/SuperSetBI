# API Reference - SupersetBI

Documentación completa de la API RESTful de SupersetBI. Todas las rutas requieren autenticación y están organizadas por módulos empresariales.

## 🌐 Base URL

```
Desarrollo: http://localhost:5000/api
Producción: https://tu-dominio.com/api
```

## 🔐 Autenticación

SupersetBI usa **autenticación basada en sesiones** con cookies HTTP-only:

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "usuario@empresa.com",
  "password": "tu_password"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "username": "usuario@empresa.com",
    "companyId": "company-uuid",
    "role": "admin"
  }
}
```

## 📊 Dashboard Analytics

### GET /api/dashboard/analytics
Obtiene métricas principales del dashboard.

**Response:**
```json
{
  "kpis": {
    "totalRevenue": 125000.50,
    "totalProducts": 156,
    "monthlySales": 24,
    "inventoryValue": 89500.00,
    "pendingCollections": 12500.00
  },
  "salesTrend": [
    {
      "month": "ene",
      "revenue": 15000.00
    }
  ],
  "inventoryDistribution": {
    "Electrónicos": 45,
    "Ropa": 32,
    "Hogar": 18
  },
  "topProducts": [
    {
      "name": "iPhone 15",
      "sales": 12,
      "revenue": 18000.00
    }
  ]
}
```

## 📦 Inventario

### GET /api/products/:companyId
Lista todos los productos de la empresa.

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Items per página (default: 50)
- `category` (opcional): Filtrar por categoría
- `search` (opcional): Búsqueda por nombre o SKU

**Response:**
```json
{
  "products": [
    {
      "id": "prod-uuid",
      "name": "Laptop Dell XPS 13",
      "sku": "LAPTOP-DELL-001",
      "price": "1299.99",
      "stock": 8,
      "minStock": 5,
      "categoryId": "cat-uuid",
      "supplierId": "sup-uuid",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "totalCount": 156,
  "page": 1,
  "totalPages": 4
}
```

### POST /api/products
Crea un nuevo producto.

**Request Body:**
```json
{
  "name": "Producto Nuevo",
  "sku": "PROD-001",
  "price": 99.99,
  "stock": 10,
  "minStock": 2,
  "categoryId": "cat-uuid",
  "supplierId": "sup-uuid",
  "description": "Descripción del producto",
  "unit": "unit"
}
```

### PUT /api/products/:id
Actualiza un producto existente.

### DELETE /api/products/:id
Elimina un producto.

### GET /api/inventory/analytics
Obtiene análisis avanzado de inventario.

**Response:**
```json
{
  "kpis": {
    "totalValue": 89500.00,
    "turnoverRate": 4.2,
    "serviceLevel": 95.5,
    "daysOfInventory": 45,
    "liquidityIndex": 0.78
  },
  "abcClassification": {
    "A": { "products": 12, "value": 60000.00 },
    "B": { "products": 24, "value": 22000.00 },
    "C": { "products": 120, "value": 7500.00 }
  },
  "alerts": [
    {
      "type": "warning",
      "title": "Stock Bajo",
      "message": "5 productos están por debajo del mínimo",
      "priority": "high"
    }
  ]
}
```

### GET /api/inventory/alerts
Obtiene alertas de inventario.

**Response:**
```json
{
  "alerts": [
    {
      "id": "alert-uuid",
      "productId": "prod-uuid",
      "productName": "Laptop Dell XPS 13",
      "alertType": "low_stock",
      "priority": "high",
      "message": "Stock bajo: 2 unidades (mínimo: 5)",
      "isResolved": false,
      "createdAt": "2024-01-15T08:00:00Z"
    }
  ]
}
```

## 💰 Ventas

### GET /api/sales/:companyId
Lista las ventas de la empresa.

**Query Parameters:**
- `startDate` (opcional): Fecha inicio (ISO 8601)
- `endDate` (opcional): Fecha fin (ISO 8601)
- `customerId` (opcional): Filtrar por cliente
- `status` (opcional): Estado del pago

**Response:**
```json
{
  "sales": [
    {
      "id": "sale-uuid",
      "customerId": "cust-uuid",
      "customerName": "Cliente S.A.",
      "salespersonId": "sales-uuid",
      "saleDate": "2024-01-15",
      "subtotal": "1000.00",
      "taxAmount": "190.00",
      "totalAmount": "1190.00",
      "paymentStatus": "paid",
      "items": [
        {
          "productId": "prod-uuid",
          "productName": "Laptop Dell XPS 13",
          "quantity": 1,
          "unitPrice": "1000.00",
          "total": "1000.00"
        }
      ]
    }
  ]
}
```

### POST /api/sales
Crea una nueva venta.

**Request Body:**
```json
{
  "customerId": "cust-uuid",
  "salespersonId": "sales-uuid",
  "saleDate": "2024-01-15",
  "paymentMethod": "credit_card",
  "items": [
    {
      "productId": "prod-uuid",
      "quantity": 2,
      "unitPrice": 99.99,
      "discount": 0
    }
  ],
  "notes": "Venta especial"
}
```

## 💸 Cobranzas

### GET /api/collections/:companyId
Lista las cuentas por cobrar.

**Query Parameters:**
- `status` (opcional): pending, overdue, paid
- `customerId` (opcional): Filtrar por cliente
- `daysOverdue` (opcional): Días de vencimiento

**Response:**
```json
{
  "collections": [
    {
      "id": "coll-uuid",
      "customerId": "cust-uuid",
      "customerName": "Cliente S.A.",
      "invoiceNumber": "INV-2024-001",
      "amount": "1190.00",
      "outstandingAmount": "1190.00",
      "dueDate": "2024-02-15",
      "daysOverdue": 5,
      "status": "overdue",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### POST /api/payments
Registra un pago.

**Request Body:**
```json
{
  "customerId": "cust-uuid",
  "accountReceivableId": "ar-uuid",
  "amount": 500.00,
  "paymentDate": "2024-01-20",
  "paymentMethod": "bank_transfer",
  "reference": "TRF-001",
  "notes": "Pago parcial"
}
```

### GET /api/collections/stats
Estadísticas de cobranzas.

**Response:**
```json
{
  "overview": {
    "totalReceivable": 45000.00,
    "totalOverdue": 8500.00,
    "totalCollected": 125000.00,
    "averageDaysToCollect": 28
  },
  "aging": {
    "current": 15000.00,
    "days1to30": 8000.00,
    "days31to60": 3000.00,
    "days61to90": 2000.00,
    "over90days": 1500.00
  }
}
```

## 🤖 Asistente de IA

### GET /api/chat/conversations
Lista conversaciones del usuario.

**Response:**
```json
{
  "conversations": [
    {
      "id": "conv-uuid",
      "title": "Análisis de inventario",
      "lastMessageAt": "2024-01-20T14:30:00Z",
      "messageCount": 8,
      "createdAt": "2024-01-20T10:00:00Z"
    }
  ]
}
```

### POST /api/chat/conversations
Crea nueva conversación.

**Request Body:**
```json
{
  "title": "Nueva consulta sobre ventas"
}
```

### GET /api/chat/conversations/:id/messages
Obtiene mensajes de una conversación.

**Response:**
```json
{
  "messages": [
    {
      "id": "msg-uuid",
      "role": "user",
      "content": "¿Cuál es el estado de mi inventario?",
      "timestamp": "2024-01-20T10:05:00Z",
      "tokenCount": 8
    },
    {
      "id": "msg-uuid-2",
      "role": "assistant",
      "content": "## 📊 Estado del Inventario\n\n**Productos totales:** 156\n**Stock bajo:** 5 productos\n**Valor total:** $89,500\n\n**Productos críticos:**\n- Laptop Dell XPS 13: 2 unidades (mínimo: 5)",
      "timestamp": "2024-01-20T10:05:15Z",
      "tokenCount": 45
    }
  ]
}
```

### POST /api/ai/chat
Envía mensaje al asistente de IA.

**Request Body:**
```json
{
  "message": "¿Qué productos debo reabastecer?",
  "conversationId": "conv-uuid"
}
```

**Response:**
```json
{
  "response": "## 🔄 Productos para Reabastecer\n\nBasado en tu inventario actual, te recomiendo reabastecer:\n\n**Prioridad Alta:**\n- Laptop Dell XPS 13: Solo 2 unidades (mínimo: 5)\n- Mouse Logitech: Agotado\n\n**Sugerencias:**\n1. Contactar proveedor Dell para pedido urgente\n2. Revisar puntos de reorden automáticos",
  "conversationId": "conv-uuid",
  "messageCount": 3
}
```

### GET /api/ai/analysis
Obtiene análisis automático del negocio.

**Response:**
```json
{
  "summary": "Tu negocio muestra un crecimiento del 15% en ventas este mes, pero hay 5 productos con stock crítico que requieren atención inmediata.",
  "insights": [
    {
      "type": "warning",
      "title": "Stock Crítico",
      "message": "5 productos están por debajo del stock mínimo",
      "priority": "high",
      "category": "inventory",
      "confidence": 0.95
    }
  ],
  "recommendations": [
    "Implementar reorden automático para productos A",
    "Revisar proveedores alternativos para productos críticos",
    "Aumentar frecuencia de revisión de inventario"
  ]
}
```

## 🏢 Gestión de Empresas

### GET /api/companies
Lista empresas (solo super_admin).

### POST /api/companies
Crea nueva empresa.

**Request Body:**
```json
{
  "name": "Mi Empresa S.A.",
  "email": "contacto@miempresa.com",
  "phone": "+1234567890",
  "address": "Av. Principal 123"
}
```

### POST /api/companies/invitations
Envía invitación a usuario.

**Request Body:**
```json
{
  "email": "usuario@email.com",
  "role": "manager"
}
```

## 📁 Gestión de Datos

### GET /api/data-imports
Lista importaciones de datos.

**Response:**
```json
{
  "imports": [
    {
      "id": "import-uuid",
      "dataType": "products",
      "filename": "productos_enero_2024.csv",
      "totalRecords": 150,
      "successfulRecords": 145,
      "failedRecords": 5,
      "status": "completed",
      "createdAt": "2024-01-15T09:00:00Z"
    }
  ]
}
```

### POST /api/data-imports/products
Importa productos desde archivo CSV/Excel.

**Request:**
```http
POST /api/data-imports/products
Content-Type: multipart/form-data

file: [archivo CSV/Excel]
```

### GET /api/data-imports/template/:type
Descarga plantilla CSV.

**Tipos disponibles:** `products`, `customers`, `sales`

## ❌ Códigos de Error

| Código | Descripción | Ejemplo |
|--------|-------------|---------|
| 400 | Bad Request | Datos inválidos |
| 401 | Unauthorized | Sin autenticación |
| 403 | Forbidden | Sin permisos |
| 404 | Not Found | Recurso no existe |
| 409 | Conflict | Recurso duplicado |
| 422 | Validation Error | Error de validación |
| 500 | Internal Server Error | Error del servidor |

**Formato de Error:**
```json
{
  "error": "Validation Error",
  "message": "El nombre del producto es requerido",
  "details": [
    {
      "field": "name",
      "message": "Required field"
    }
  ]
}
```

## 🔄 Paginación

Las rutas que devuelven listas incluyen paginación:

**Query Parameters:**
- `page`: Número de página (default: 1)
- `limit`: Items por página (default: 50, max: 100)

**Response Headers:**
```http
X-Total-Count: 156
X-Page: 1
X-Total-Pages: 4
```

## 🎯 Filtros Avanzados

Muchas rutas soportan filtros avanzados:

```http
GET /api/products?filters=[
  {
    "field": "price",
    "operator": "gte",
    "value": 100
  },
  {
    "field": "category",
    "operator": "eq",
    "value": "Electronics"
  }
]
```

**Operadores disponibles:**
- `eq`: Igual
- `neq`: No igual
- `gt`: Mayor que
- `gte`: Mayor o igual
- `lt`: Menor que
- `lte`: Menor o igual
- `contains`: Contiene texto
- `in`: En lista de valores

## 📊 Rate Limiting

La API tiene límites de velocidad:

- **Endpoints generales**: 1000 requests/hora
- **IA Chat**: 100 requests/hora
- **Data Import**: 10 requests/hora

**Headers de respuesta:**
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 3600
```

## 🔔 Webhooks (Futuro)

SupersetBI planea soportar webhooks para eventos importantes:

- Producto con stock bajo
- Nueva venta registrada
- Pago recibido
- Alerta de IA generada

---

Esta API está diseñada para ser **intuitiva**, **consistente** y **escalable**. Todos los endpoints siguen patrones REST estándar y proporcionan respuestas detalladas para facilitar la integración. 🚀