# SupersetBI - Business Intelligence Dashboard

Una plataforma completa de Business Intelligence diseñada para PyMEs que proporciona dashboards profesionales para la toma de decisiones basada en datos.

## 🚀 Inicio Rápido

### Desarrollo Local
```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# La aplicación estará disponible en http://localhost:5000
```

### Requisitos y configuración rápida
- PostgreSQL local o Neon. Crea `.env` en la raíz con:
```
DATABASE_URL=postgresql://usuario:password@localhost:5432/supersetbi
NODE_ENV=development
# Opcional para habilitar IA
GEMINI_API_KEY=AIza...
```

### Migraciones (Drizzle)
```bash
npm run db:generate   # genera SQL en ./migrations
npm run db:push       # aplica cambios a la base de datos
npm run db:studio     # abre el estudio de esquema
```

### Usando Replit
1. Fork este proyecto en Replit
2. La aplicación se ejecutará automáticamente
3. Usar el botón "Deploy" para producción

## ✨ Características

- **Dashboard Ejecutivo**: KPIs y métricas en tiempo real
- **Control de Inventario**: Gestión avanzada con análisis ABC y alertas
- **Gestión de Cobranza**: Seguimiento de pagos y clientes
- **Seguimiento de Ventas**: Analytics de transacciones y rendimiento
- **Responsive Design**: Optimizado para todos los dispositivos

## 🛠️ Stack Tecnológico

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, TypeScript
- **Base de Datos**: PostgreSQL con Drizzle ORM
- **Desarrollo**: Vite, ESBuild, Replit

## 📊 Módulos Principales

### 1. Dashboard
- KPIs ejecutivos consolidados
- Gráficos interactivos
- Métricas de rendimiento general

### 2. Inventario Avanzado
- **KPIs Profesionales**: ROI, rotación, nivel de servicio
- **Sistema de Alertas**: Stock bajo, agotados, excesos
- **Análisis ABC**: Clasificación por valor e impacto
- **Recomendaciones**: Sugerencias automáticas de reposición/liquidación
- **Filtros Avanzados**: Búsqueda y filtrado multi-criterio

### 3. Cobranza
- Seguimiento de pagos pendientes
- Gestión de clientes
- Alertas de vencimientos

### 4. Ventas
- Tracking de transacciones
- Analytics de performance
- Tendencias y pronósticos

## 🗄️ Base de Datos

### Estado Actual
- **Desarrollo/Producción**: PostgreSQL con Drizzle ORM (driver `pg`)

### Migrar/usar PostgreSQL
Ver documentación completa en [DATABASE_SETUP.md](./DATABASE_SETUP.md)

```bash
# Ejecutar migraciones
npm run db:generate
npm run db:push
```

## 🧪 Testing

```bash
# Ejecutar pruebas
npm test

# Pruebas con coverage
npm run test:coverage

# Testing de APIs
curl http://localhost:5000/api/products
curl http://localhost:5000/api/inventory/analytics
```

## 🚀 Deployment

### Replit (Recomendado)
1. Configurar secrets de base de datos
2. Usar botón "Deploy" en la interfaz
3. La aplicación será accesible en dominio `.replit.app`

### Otros Proveedores
```bash
# Vercel
vercel --prod

# Heroku
git push heroku main
```

## 📁 Estructura del Proyecto

```
supersetBI/
├── client/src/
│   ├── components/       # Componentes React
│   ├── pages/           # Páginas principales
│   ├── hooks/           # Custom hooks
│   └── lib/             # Utilities
├── server/
│   ├── routes.ts        # API endpoints
│   ├── storage.ts       # Data layer
│   └── inventory-utils.ts # Cálculos de KPIs
├── shared/
│   └── schema.ts        # Database schemas
└── docs/                # Documentación
```

## 🔧 Scripts Disponibles

```bash
npm run dev          # Desarrollo
npm run build        # Build producción
npm run start        # Servidor producción
npm run db:migrate   # Migraciones DB
npm run db:seed      # Datos iniciales
npm run db:studio    # Interface gráfica DB
npm run test         # Ejecutar pruebas
```

## 📖 Documentación

- [Documentación Completa](./DOCUMENTATION.md) - Guía técnica completa
- [Setup de Base de Datos](./DATABASE_SETUP.md) - Migración a PostgreSQL
- [Arquitectura del Sistema](./DOCUMENTATION.md#-arquitectura-del-sistema)

## 🤝 Contribución

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está licenciado bajo MIT License.

## 🆘 Soporte

Para reportar issues o solicitar features:
- Crear issue en GitHub
- Incluir pasos para reproducir
- Especificar entorno y versión

---

**SupersetBI** - Transformando datos en decisiones inteligentes para PyMEs