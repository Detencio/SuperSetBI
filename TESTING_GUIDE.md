# Guía de Testing y Ambiente de Pruebas - SupersetBI

## 🧪 Configuración de Ambiente de Testing

### Datos de Prueba Incluidos

El sistema incluye datos de prueba preconfigurados que se cargan automáticamente:

```typescript
// 10 productos de ejemplo distribuidos en 6 categorías
- Productos Premium: Laptop, Monitor 4K, etc.
- Productos Estándar: Smartphone, Cafetera, etc.
- Productos Económicos: Tablet, Kit herramientas, etc.
- Electrónicos: Dispositivos tech
- Hogar: Productos domésticos
- Oficina: Suministros corporativos
```

### URLs de Testing

```bash
# Aplicación principal
http://localhost:5000

# APIs principales
http://localhost:5000/api/products
http://localhost:5000/api/inventory/analytics
http://localhost:5000/api/inventory/alerts
http://localhost:5000/api/dashboard/analytics
http://localhost:5000/api/sales
http://localhost:5000/api/collections
```

---

## 🔍 Testing Manual de Funcionalidades

### Dashboard Principal
✅ **Verificar**: KPIs generales se muestran correctamente
✅ **Verificar**: Gráficos cargan sin errores
✅ **Verificar**: Navegación responsive funciona

### Módulo de Inventario Avanzado

#### KPIs Profesionales
✅ **Valor Total del Stock**: Debe mostrar suma correcta de todos los productos
✅ **Rotación de Inventario**: Cálculo basado en ventas vs stock promedio
✅ **Nivel de Servicio**: Porcentaje de disponibilidad
✅ **Días de Inventario**: Cobertura estimada
✅ **Análisis ABC**: Distribución porcentual A/B/C

#### Sistema de Alertas
✅ **Alertas de Stock Bajo**: Productos con stock <= minStock
✅ **Alertas Críticas**: Productos con stock = 0
✅ **Alertas de Exceso**: Productos con stock > maxStock * 1.2
✅ **Prioridades**: Critical > High > Medium > Low

#### Filtros y Búsqueda
✅ **Búsqueda por nombre**: Filtro en tiempo real
✅ **Búsqueda por SKU**: Código de producto
✅ **Filtro por categoría**: Dropdown dinámico
✅ **Filtro por estado**: Stock bajo/agotado/exceso

#### Recomendaciones
✅ **Reponer**: Lista productos con stock bajo
✅ **Liquidar**: Lista productos con exceso
✅ **Mantener**: Productos en nivel óptimo

---

## 🚀 Testing de APIs

### Scripts de Prueba Rápida

```bash
# Verificar que todos los endpoints responden
echo "Testing API endpoints..."

# Dashboard
curl -s http://localhost:5000/api/dashboard/analytics | jq '.kpis.totalRevenue'

# Productos
curl -s http://localhost:5000/api/products | jq 'length'

# KPIs de Inventario
curl -s http://localhost:5000/api/inventory/analytics | jq '.totalStockValue'

# Alertas de Inventario
curl -s http://localhost:5000/api/inventory/alerts | jq 'length'

# Ventas
curl -s http://localhost:5000/api/sales | jq 'length'

# Collections
curl -s http://localhost:5000/api/collections | jq 'length'
```

### Respuestas Esperadas

#### /api/inventory/analytics
```json
{
  "totalStockValue": 48746.8,
  "totalProducts": 10,
  "lowStockProducts": 2,
  "outOfStockProducts": 0,
  "excessStockProducts": 1,
  "inventoryTurnover": 2.4,
  "serviceLevel": 98,
  "daysOfInventory": 152,
  "abcDistribution": {
    "A": 20,
    "B": 30,
    "C": 50
  },
  "liquidityIndex": 85,
  "inventoryAccuracy": 98
}
```

#### /api/inventory/alerts
```json
[
  {
    "productId": "prod-001",
    "productName": "Producto X",
    "alertType": "low_stock",
    "priority": "high",
    "message": "Stock bajo: 5 unidades (mínimo: 10)",
    "threshold": 10,
    "currentValue": 5
  }
]
```

---

## 📱 Testing de Responsive Design

### Breakpoints a Verificar

```css
/* Mobile */
sm: 640px - Menú colapsado, tablas adaptadas
md: 768px - Columnas ocultas apropiadamente
lg: 1024px - Layout completo
xl: 1280px - Todas las funcionalidades visibles
```

### Elementos Críticos Mobile
✅ **Sidebar**: Debe colapsar con overlay
✅ **Tablas**: Columnas se ocultan progresivamente
✅ **KPIs**: Cards se apilan verticalmente
✅ **Filtros**: Dropdowns se adaptan al ancho
✅ **Botones**: Tamaño apropiado para touch

---

## 🔧 Testing de Performance

### Métricas a Verificar

```bash
# Time to First Byte
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:5000/

# Tamaño de respuestas API
curl -s http://localhost:5000/api/products | wc -c
curl -s http://localhost:5000/api/inventory/analytics | wc -c
```

### Targets de Performance
- **TTFB**: < 200ms
- **API Response**: < 100ms
- **Bundle Size**: < 1MB
- **Loading States**: Siempre visibles durante fetch

---

## 🐛 Casos de Error a Probar

### Manejo de Errores
✅ **Sin conexión**: Aplicación muestra estado offline
✅ **API down**: Loading states y mensajes de error
✅ **Datos vacíos**: Estados vacíos apropiados
✅ **Timeout**: Reintento automático o manual

### Validaciones
✅ **Filtros**: Manejan valores inválidos
✅ **Búsquedas**: Términos vacíos o muy largos
✅ **Navegación**: URLs inválidas redirigen apropiadamente

---

## 📊 Testing con Base de Datos Real

### Setup PostgreSQL Testing

```bash
# 1. Configurar DB de testing
DATABASE_URL=postgresql://user:pass@localhost/supersetbi_test npm run db:migrate

# 2. Cargar datos de prueba
DATABASE_URL=postgresql://user:pass@localhost/supersetbi_test npm run db:seed

# 3. Ejecutar aplicación contra DB real
DATABASE_URL=postgresql://user:pass@localhost/supersetbi_test npm run dev
```

### Verificaciones Post-Migración
✅ **Persistencia**: Datos se guardan correctamente
✅ **Relaciones**: Foreign keys funcionan
✅ **Performance**: Queries optimizadas
✅ **Transacciones**: ACID compliance

---

## 🚀 Pre-Deployment Checklist

### Funcionalidad
- [ ] Todos los módulos cargan sin errores
- [ ] APIs responden correctamente
- [ ] KPIs muestran valores reales
- [ ] Alertas se generan apropiadamente
- [ ] Filtros y búsquedas funcionan
- [ ] Responsive design verificado
- [ ] Performance dentro de targets

### Configuración
- [ ] Variables de entorno configuradas
- [ ] Base de datos migrada
- [ ] SSL configurado (producción)
- [ ] CORS configurado apropiadamente
- [ ] Logs configurados

### Seguridad
- [ ] API keys en variables de entorno
- [ ] No hay credenciales hardcodeadas
- [ ] Validación de inputs
- [ ] Rate limiting (si aplica)

---

## 📞 Troubleshooting Común

### "No data showing"
```bash
# Verificar conexión API
curl http://localhost:5000/api/products

# Verificar console de browser
F12 > Network > Verificar requests
```

### "KPIs showing 0"
```bash
# Verificar datos de base
curl http://localhost:5000/api/inventory/analytics

# Verificar cálculos en server/inventory-utils.ts
```

### "Responsive not working"
```bash
# Verificar breakpoints en DevTools
F12 > Toggle device toolbar
```

### "Slow performance"
```bash
# Verificar bundle size
npm run build
# Verificar network requests en DevTools
```

---

## 🎯 Métricas de Éxito

### Funcionales
- ✅ 100% módulos funcionando
- ✅ 0 errores críticos en console
- ✅ < 3s tiempo de carga inicial
- ✅ Todas las APIs responden < 500ms

### UX
- ✅ Responsive en todos los dispositivos
- ✅ Loading states siempre visibles
- ✅ Navegación intuitiva
- ✅ Feedback apropiado para acciones de usuario

### Técnicas
- ✅ TypeScript sin errores
- ✅ ESLint/Prettier passes
- ✅ Bundle optimizado
- ✅ SEO básico implementado

---

*Guía de Testing creada para SupersetBI v1.0*