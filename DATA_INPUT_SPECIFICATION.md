# Especificación de Ingesta de Datos - SupersetBI

## Resumen Ejecutivo

SupersetBI requiere datos estructurados para generar KPIs profesionales y análisis empresariales. Este documento define los formatos exactos, campos obligatorios y métodos de ingesta de datos para cada módulo.

## Métodos de Ingesta de Datos

### 1. API RESTful
- **Endpoint Base**: `/api/data-ingestion`
- **Autenticación**: Bearer Token o API Key
- **Formato**: JSON
- **Validación**: Esquemas Zod en tiempo real

### 2. Carga de Archivos
- **Formatos Soportados**: CSV, Excel (.xlsx), JSON
- **Tamaño Máximo**: 50MB por archivo
- **Validación**: Automática con reportes de errores
- **Procesamiento**: Asíncrono con notificaciones de estado

---

## MÓDULO DE INVENTARIO

### Datos Requeridos para KPIs Profesionales

#### Productos (Products)
```json
{
  "id": "string|number",
  "sku": "string (único)",
  "name": "string",
  "description": "string (opcional)",
  "category": "string",
  "supplier": "string",
  "cost_price": "number (precio de costo)",
  "selling_price": "number (precio de venta)",
  "current_stock": "number",
  "minimum_stock": "number",
  "maximum_stock": "number",
  "reorder_point": "number",
  "lead_time_days": "number",
  "expiration_date": "date (opcional)",
  "location": "string (ubicación física)",
  "unit_of_measure": "string",
  "status": "active|inactive|discontinued"
}
```

#### Movimientos de Inventario (Inventory Movements)
```json
{
  "id": "string|number",
  "product_id": "string|number",
  "movement_type": "entry|exit|adjustment|transfer",
  "quantity": "number",
  "unit_cost": "number",
  "reference_document": "string",
  "supplier_id": "string (para entradas)",
  "customer_id": "string (para salidas)",
  "warehouse_from": "string (para transferencias)",
  "warehouse_to": "string (para transferencias)",
  "movement_date": "datetime",
  "notes": "string (opcional)"
}
```

#### Proveedores (Suppliers)
```json
{
  "id": "string|number",
  "name": "string",
  "contact_person": "string",
  "email": "string",
  "phone": "string",
  "address": "string",
  "payment_terms": "number (días)",
  "lead_time": "number (días)",
  "rating": "number (1-5)"
}
```

### KPIs Calculados Automáticamente
1. **ROI por Producto**: `(selling_price - cost_price) / cost_price * 100`
2. **Rotación de Inventario**: `costo_mercancías_vendidas / inventario_promedio`
3. **Días de Inventario**: `365 / rotación_inventario`
4. **Nivel de Servicio**: `pedidos_completos / total_pedidos * 100`
5. **Análisis ABC**: Clasificación por valor (80/15/5)
6. **Índice de Liquidez**: Productos con rotación lenta
7. **Precisión de Inventario**: Diferencias entre físico y sistema

---

## MÓDULO DE VENTAS

### Datos Requeridos para Análisis de Ventas

#### Ventas (Sales)
```json
{
  "id": "string|number",
  "invoice_number": "string",
  "customer_id": "string|number",
  "salesperson_id": "string|number",
  "sale_date": "datetime",
  "due_date": "date",
  "subtotal": "number",
  "tax_amount": "number",
  "discount_amount": "number",
  "total_amount": "number",
  "payment_status": "pending|partial|paid|overdue",
  "payment_method": "cash|card|transfer|check|credit",
  "channel": "store|online|phone|app",
  "currency": "string"
}
```

#### Detalles de Venta (Sale Items)
```json
{
  "id": "string|number",
  "sale_id": "string|number",
  "product_id": "string|number",
  "quantity": "number",
  "unit_price": "number",
  "discount_percentage": "number",
  "line_total": "number"
}
```

#### Clientes (Customers)
```json
{
  "id": "string|number",
  "name": "string",
  "email": "string",
  "phone": "string",
  "address": "string",
  "city": "string",
  "state": "string",
  "postal_code": "string",
  "customer_type": "individual|business",
  "credit_limit": "number",
  "payment_terms": "number (días)",
  "registration_date": "date"
}
```

### KPIs Calculados Automáticamente
1. **Ingresos Totales**: Suma de ventas por período
2. **Crecimiento de Ventas**: Comparación período anterior
3. **Ticket Promedio**: Total ventas / número transacciones
4. **Margen Bruto**: (Ingresos - COGS) / Ingresos * 100
5. **Conversión por Canal**: Ventas por canal de venta
6. **Top Productos**: Ranking por ingresos y volumen
7. **Performance por Vendedor**: Ventas y objetivos

---

## MÓDULO DE COBRANZA

### Datos Requeridos para Gestión de Cobranza

#### Cuentas por Cobrar (Accounts Receivable)
```json
{
  "id": "string|number",
  "customer_id": "string|number",
  "invoice_id": "string|number",
  "invoice_date": "date",
  "due_date": "date",
  "original_amount": "number",
  "outstanding_amount": "number",
  "currency": "string",
  "aging_days": "number",
  "status": "current|overdue_30|overdue_60|overdue_90|overdue_120+",
  "priority": "low|medium|high|critical",
  "collection_agent": "string",
  "last_contact_date": "date",
  "next_contact_date": "date"
}
```

#### Pagos (Payments)
```json
{
  "id": "string|number",
  "customer_id": "string|number",
  "invoice_id": "string|number",
  "payment_date": "date",
  "amount": "number",
  "payment_method": "cash|check|transfer|card",
  "reference": "string",
  "notes": "string"
}
```

#### Actividades de Cobranza (Collection Activities)
```json
{
  "id": "string|number",
  "customer_id": "string|number",
  "invoice_id": "string|number",
  "activity_type": "call|email|letter|visit|promise|payment",
  "activity_date": "datetime",
  "agent": "string",
  "notes": "string",
  "result": "contacted|no_answer|promise|dispute|paid",
  "follow_up_date": "date"
}
```

### KPIs Calculados Automáticamente
1. **DSO (Days Sales Outstanding)**: Días promedio de cobro
2. **Aging Analysis**: Distribución por períodos de vencimiento
3. **Collection Rate**: Porcentaje de recuperación
4. **Bad Debt Ratio**: Porcentaje de deuda incobrable
5. **Cash Flow Forecast**: Proyección de cobros
6. **Customer Risk Score**: Evaluación de riesgo crediticio

---

## FORMATOS DE ARCHIVO SOPORTADOS

### CSV Template Headers

#### Productos (products.csv)
```csv
sku,name,description,category,supplier,cost_price,selling_price,current_stock,minimum_stock,maximum_stock,reorder_point,lead_time_days,expiration_date,location,unit_of_measure,status
```

#### Ventas (sales.csv)
```csv
invoice_number,customer_id,customer_name,sale_date,due_date,subtotal,tax_amount,discount_amount,total_amount,payment_status,payment_method,channel,currency
```

#### Cuentas por Cobrar (receivables.csv)
```csv
customer_id,customer_name,invoice_id,invoice_date,due_date,original_amount,outstanding_amount,currency,status,priority,collection_agent,last_contact_date
```

### Excel Templates
- Cada módulo tendrá una hoja separada
- Validación de datos integrada
- Formatos de celdas predefinidos
- Ejemplos incluidos

### JSON Bulk Import
```json
{
  "data_type": "inventory|sales|collections",
  "records": [...],
  "metadata": {
    "source": "string",
    "import_date": "datetime",
    "total_records": "number"
  }
}
```

---

## VALIDACIONES Y REGLAS DE NEGOCIO

### Validaciones Generales
- Campos obligatorios marcados
- Formatos de fecha consistentes (ISO 8601)
- Números positivos donde corresponda
- Límites de caracteres en texto
- Validación de emails y teléfonos

### Reglas de Integridad
- SKUs únicos por producto
- Referencias válidas entre tablas
- Fechas lógicas (venta < vencimiento)
- Cantidades y precios > 0
- Estados válidos según catálogo

### Transformaciones Automáticas
- Normalización de texto (trim, case)
- Conversión de fechas a formato estándar
- Cálculo automático de campos derivados
- Asignación de IDs secuenciales

---

## ENDPOINTS DE API

### Inventario
- `POST /api/data-ingestion/products` - Crear/actualizar productos
- `POST /api/data-ingestion/movements` - Registrar movimientos
- `POST /api/data-ingestion/suppliers` - Gestionar proveedores

### Ventas
- `POST /api/data-ingestion/sales` - Registrar ventas
- `POST /api/data-ingestion/customers` - Gestionar clientes
- `POST /api/data-ingestion/payments` - Registrar pagos

### Cobranza
- `POST /api/data-ingestion/receivables` - Cuentas por cobrar
- `POST /api/data-ingestion/collection-activities` - Actividades

### Utilidades
- `POST /api/data-ingestion/validate` - Validar datos antes de importar
- `GET /api/data-ingestion/templates` - Descargar plantillas
- `GET /api/data-ingestion/status/{import_id}` - Estado de importación

---

## IMPLEMENTACIÓN TÉCNICA

### Stack de Ingesta
- **Backend**: Express.js con middleware de validación
- **Validación**: Zod schemas
- **Procesamiento**: Queue system para archivos grandes
- **Storage**: PostgreSQL con transacciones
- **File Upload**: Multer + cloud storage
- **Error Handling**: Logs detallados y reportes

### Flujo de Procesamiento
1. **Recepción**: API o file upload
2. **Validación**: Schema y reglas de negocio
3. **Transformación**: Normalización y limpieza
4. **Almacenamiento**: Transaccional con rollback
5. **Notificación**: Status updates y reportes
6. **Actualización**: Refresh de KPIs y métricas

Esta especificación garantiza que todos los KPIs y métricas de SupersetBI funcionen con datos reales y precisos, proporcionando valor empresarial inmediato a los usuarios.