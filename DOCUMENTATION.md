# SupersetBI - Documentación Completa

## 🎯 Descripción del Proyecto

**SupersetBI** es una plataforma completa de Business Intelligence (BI) diseñada para pequeñas y medianas empresas (PyMEs). Proporciona dashboards profesionales similares a PowerBI para la toma de decisiones basada en datos, enfocándose en tres áreas clave del negocio:

- **Control de Inventario**: Gestión avanzada de productos con KPIs profesionales
- **Gestión de Cobranza**: Seguimiento de pagos y clientes
- **Seguimiento de Ventas**: Análisis de transacciones y rendimiento comercial

### Características Principales

✅ **Dashboards Interactivos**: Visualizaciones dinámicas con métricas en tiempo real
✅ **Responsive Design**: Optimizado para desktop, tablet y móvil
✅ **KPIs Profesionales**: Métricas avanzadas como ROI, rotación de inventario, análisis ABC
✅ **Sistema de Alertas**: Notificaciones automáticas basadas en umbrales configurables
✅ **Recomendaciones Inteligentes**: Sugerencias automáticas para optimización de inventario
✅ **Filtros Avanzados**: Búsqueda y filtrado dinámico por múltiples criterios

---

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** - Biblioteca principal para UI
- **TypeScript** - Tipado estático y mejor experiencia de desarrollo
- **Vite** - Build tool y servidor de desarrollo rápido
- **Tailwind CSS** - Framework CSS utility-first
- **shadcn/ui** - Componentes UI modernos basados en Radix UI
- **Radix UI** - Primitivos UI accesibles y personalizables
- **TanStack Query (React Query)** - Gestión de estado del servidor
- **Wouter** - Router ligero para SPA
- **Recharts** - Biblioteca de gráficos basada en D3
- **Lucide React** - Iconografía consistente

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web minimalista
- **TypeScript** - Tipado estático en el backend
- **ESBuild** - Bundler rápido para producción

### Base de Datos y ORM
- **PostgreSQL** - Base de datos relacional principal (Neon Database)
- **Drizzle ORM** - ORM type-safe para TypeSQL
- **Drizzle Kit** - Herramientas de migración y esquema

### Desarrollo y Herramientas
- **ESLint** - Linting de código
- **Prettier** - Formateo automático de código
- **Replit** - Entorno de desarrollo integrado

### Almacenamiento Actual
- **In-Memory Storage** - Implementación temporal usando Map() para desarrollo rápido
- **Migración Ready** - Esquemas preparados para transición a PostgreSQL

---

## 📊 Arquitectura del Sistema

### Estructura del Proyecto
```
supersetBI/
├── client/                     # Frontend React
│   ├── src/
│   │   ├── components/         # Componentes reutilizables
│   │   │   ├── ui/            # Componentes base (shadcn/ui)
│   │   │   ├── layout/        # Layout components (Sidebar, TopBar)
│   │   │   └── inventory/     # Componentes específicos de inventario
│   │   ├── pages/             # Páginas principales
│   │   ├── hooks/             # Custom hooks
│   │   └── lib/               # Utilities y configuraciones
│   └── index.html             # Entry point
├── server/                    # Backend Express
│   ├── index.ts              # Servidor principal
│   ├── routes.ts             # Definición de rutas API
│   ├── storage.ts            # Interfaz de almacenamiento
│   └── inventory-utils.ts    # Utilidades de cálculos de inventario
├── shared/                   # Código compartido
│   └── schema.ts            # Esquemas de base de datos (Drizzle)
└── attached_assets/         # Recursos estáticos
```

### Patrón de Arquitectura
- **Separación de Responsabilidades**: Frontend, Backend y Base de Datos claramente separados
- **Type Safety**: TypeScript en toda la aplicación con tipos compartidos
- **API RESTful**: Endpoints bien definidos siguiendo convenciones REST
- **Component-Based**: Arquitectura de componentes reutilizables
- **State Management**: TanStack Query para estado del servidor, React hooks para estado local

---

## 🗄️ Modelo de Datos

### Entidades Principales

#### Products (Productos)
```typescript
{
  id: string
  name: string
  description?: string
  price: string
  category: string
  stock: number
  minStock?: number
  maxStock?: number
  sku?: string
  createdAt: Date
  updatedAt: Date
}
```

#### Categories (Categorías)
```typescript
{
  id: string
  name: string
  description?: string
  createdAt: Date
}
```

#### Suppliers (Proveedores)
```typescript
{
  id: string
  name: string
  contactEmail?: string
  contactPhone?: string
  address?: string
  createdAt: Date
}
```

#### Purchase Orders (Órdenes de Compra)
```typescript
{
  id: string
  supplierId: string
  orderDate: Date
  expectedDeliveryDate?: Date
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled'
  totalAmount: string
  notes?: string
  createdAt: Date
}
```

#### Inventory Movements (Movimientos de Inventario)
```typescript
{
  id: string
  productId: string
  movementType: 'in' | 'out' | 'adjustment'
  quantity: number
  reason?: string
  reference?: string
  movementDate: Date
  createdAt: Date
}
```

---

## 🚀 Configuración e Instalación

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- PostgreSQL (para producción)

### Instalación Local

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd supersetBI
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
# Crear archivo .env en la raíz del proyecto
DATABASE_URL=postgresql://username:password@localhost:5432/supersetbi
NODE_ENV=development
PORT=5000
```

4. **Ejecutar en modo desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5000`

---

## 🎯 Configuración de Base de Datos PostgreSQL

### Opción 1: Base de Datos Local

1. **Instalar PostgreSQL**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS con Homebrew
brew install postgresql
brew services start postgresql
```

2. **Crear base de datos y usuario**
```sql
-- Conectar como usuario postgres
sudo -u postgres psql

-- Crear base de datos
CREATE DATABASE supersetbi;

-- Crear usuario
CREATE USER supersetbi_user WITH PASSWORD 'tu_password_seguro';

-- Otorgar permisos
GRANT ALL PRIVILEGES ON DATABASE supersetbi TO supersetbi_user;
GRANT ALL ON SCHEMA public TO supersetbi_user;
```

3. **Configurar conexión**
```bash
# En archivo .env
DATABASE_URL=postgresql://supersetbi_user:tu_password_seguro@localhost:5432/supersetbi
```

### Opción 2: Neon Database (Recomendado para Producción)

1. **Crear cuenta en Neon Database**
   - Visitar [neon.tech](https://neon.tech)
   - Crear nuevo proyecto
   - Obtener string de conexión

2. **Configurar variables de entorno**
```bash
# En archivo .env
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb
PGHOST=ep-xxx.us-east-2.aws.neon.tech
PGDATABASE=neondb
PGUSER=username
PGPASSWORD=password
PGPORT=5432
```

### Migración de Datos

1. **Ejecutar migraciones**
```bash
# Generar archivos de migración
npm run db:generate

# Aplicar migraciones
npm run db:migrate

# Ver estado de migraciones
npm run db:studio
```

2. **Semillas de datos (opcional)**
```bash
npm run db:seed
```

---

## 🧪 Ambiente de Testing

### Configuración de Pruebas

1. **Crear base de datos de testing**
```sql
CREATE DATABASE supersetbi_test;
GRANT ALL PRIVILEGES ON DATABASE supersetbi_test TO supersetbi_user;
```

2. **Configurar variables de entorno de test**
```bash
# En archivo .env.test
NODE_ENV=test
DATABASE_URL=postgresql://supersetbi_user:tu_password_seguro@localhost:5432/supersetbi_test
```

3. **Ejecutar pruebas**
```bash
# Instalar dependencias de testing
npm install --save-dev jest @types/jest supertest

# Ejecutar pruebas
npm run test

# Ejecutar pruebas con coverage
npm run test:coverage
```

### Datos de Prueba

El sistema incluye datos de prueba predefinidos que se cargan automáticamente:

```typescript
// Productos de ejemplo
[
  {
    name: "Producto Premium A",
    category: "Premium",
    price: "299.99",
    stock: 45,
    minStock: 10
  },
  // ... más productos
]
```

### Testing de APIs

```bash
# Probar endpoints principales
curl -X GET http://localhost:5000/api/products
curl -X GET http://localhost:5000/api/inventory/analytics
curl -X GET http://localhost:5000/api/inventory/alerts
```

---

## 📈 KPIs y Métricas Implementadas

### Inventario
- **Valor Total del Stock**: Suma del valor de todos los productos
- **Rotación de Inventario**: Frecuencia de renovación del inventario
- **Nivel de Servicio**: Porcentaje de disponibilidad de productos
- **Días de Inventario**: Días de cobertura basado en consumo promedio
- **Índice de Liquidez**: Facilidad de conversión a efectivo
- **Precisión de Inventario**: Exactitud entre stock físico y registrado
- **Clasificación ABC**: Categorización por valor e impacto

### Alertas Automáticas
- **Stock Bajo**: Productos por debajo del mínimo
- **Sin Stock**: Productos agotados
- **Exceso de Stock**: Productos con inventario excesivo
- **Próximos a Vencer**: (Preparado para implementación futura)

---

## 🔒 Seguridad y Autenticación

### Estado Actual
- Implementación básica sin autenticación (desarrollo)
- Preparado para integración con sistemas de autenticación

### Recomendaciones para Producción
- Implementar JWT tokens
- Configurar CORS apropiadamente
- Usar HTTPS en todas las comunicaciones
- Implementar rate limiting
- Validación de inputs en backend

---

## 🚀 Despliegue a Producción

### Replit Deployment

1. **Configurar secrets en Replit**
   - `DATABASE_URL`: URL de conexión a PostgreSQL
   - `NODE_ENV`: "production"

2. **Deploy automático**
   - El proyecto está configurado para deploy automático en Replit
   - Usar el botón "Deploy" en la interfaz

### Otros Proveedores

#### Vercel
```bash
npm install -g vercel
vercel --prod
```

#### Heroku
```bash
# Instalar Heroku CLI
heroku create supersetbi-app
heroku config:set DATABASE_URL=your_database_url
git push heroku main
```

---

## 📝 Comandos Útiles

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo
npm run build           # Build para producción
npm run start           # Iniciar servidor de producción

# Base de datos
npm run db:generate     # Generar migraciones
npm run db:migrate      # Aplicar migraciones
npm run db:studio       # Interface gráfica de DB
npm run db:seed         # Cargar datos de prueba

# Testing
npm run test            # Ejecutar pruebas
npm run test:watch      # Pruebas en modo watch
npm run test:coverage   # Pruebas con cobertura

# Utilidades
npm run lint           # Verificar código
npm run lint:fix       # Corregir problemas automáticamente
npm run format         # Formatear código con Prettier
```

---

## 🔧 Troubleshooting

### Problemas Comunes

1. **Error de conexión a base de datos**
   - Verificar variables de entorno
   - Comprobar que PostgreSQL esté ejecutándose
   - Validar permisos de usuario

2. **Problemas de build**
   - Limpiar cache: `npm run clean`
   - Reinstalar dependencias: `rm -rf node_modules && npm install`

3. **Errores de CORS**
   - Verificar configuración en `server/index.ts`
   - Asegurar que las URLs coincidan

### Logs y Debugging
```bash
# Ver logs de aplicación
npm run dev -- --verbose

# Logs de base de datos
tail -f /var/log/postgresql/postgresql-*.log
```

---

## 🤝 Contribución

### Guías de Desarrollo
1. Seguir convenciones de TypeScript
2. Usar Prettier para formateo
3. Escribir pruebas para nuevas funcionalidades
4. Documentar cambios significativos
5. Seguir patrones de componentes establecidos

### Pull Request Process
1. Fork del repositorio
2. Crear feature branch
3. Implementar cambios
4. Agregar pruebas
5. Actualizar documentación
6. Enviar PR con descripción detallada

---

## 📞 Soporte

Para reportar bugs o solicitar nuevas funcionalidades:
- Crear issue en el repositorio
- Incluir pasos para reproducir
- Especificar entorno y versión
- Adjuntar logs relevantes

---

*Documentación generada para SupersetBI v1.0 - Agosto 2025*