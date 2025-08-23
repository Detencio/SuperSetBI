# SupersetBI - Sistema de Business Intelligence

[![Estado del Proyecto](https://img.shields.io/badge/Estado-Activo-green.svg)]()
[![Versión](https://img.shields.io/badge/Versión-2.0-blue.svg)]()
[![Base de Datos](https://img.shields.io/badge/BD-PostgreSQL-blue.svg)]()
[![IA](https://img.shields.io/badge/IA-Gemini_2.5_Flash-orange.svg)]()

SupersetBI es una aplicación completa de Business Intelligence (BI) diseñada para proporcionar análisis empresariales avanzados con inteligencia artificial integrada.

## 🚀 Características Principales

### 📊 Módulos de Negocio
- **Dashboard Ejecutivo**: Vista general con KPIs y métricas clave
- **Gestión de Inventario**: Control completo con análisis ABC, alertas inteligentes y recomendaciones
- **Seguimiento de Ventas**: Análisis detallado con filtros avanzados y segmentación
- **Gestión de Cobranzas**: Control de pagos y seguimiento de clientes
- **Asistente de IA**: Consultor inteligente con historial persistente de conversaciones

### 🤖 Inteligencia Artificial
- **Modelo**: Google Gemini 2.5 Flash
- **Capacidades**: 
  - Análisis contextual de datos empresariales
  - Recomendaciones personalizadas
  - Insights predictivos
  - Historial de conversaciones persistente
- **Optimización**: Gestión inteligente de tokens para reducir costos

### 🏢 Multi-Tenancy
- Aislamiento completo de datos por empresa
- Gestión de usuarios y roles
- Sistema de invitaciones
- Seguridad de datos empresariales

## 🛠️ Tecnologías

### Frontend
- **React 18** con TypeScript
- **Vite** como herramienta de build
- **shadcn/ui** sobre Radix UI
- **Tailwind CSS** para estilos
- **TanStack Query** para gestión de estado
- **Recharts** para visualizaciones

### Backend
- **Node.js** con Express.js
- **TypeScript** para seguridad de tipos
- **PostgreSQL** (Neon Database)
- **Drizzle ORM** para base de datos
- **API RESTful** con autenticación

### IA y Datos
- **Google Gemini API** para procesamiento de IA
- **PostgreSQL** para persistencia
- **Sistema de chat** con tablas dedicadas
- **Análisis en tiempo real** de datos empresariales

## 📁 Estructura del Proyecto

```
supersetBI/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes UI
│   │   ├── pages/          # Páginas de la aplicación
│   │   ├── lib/            # Utilidades y configuración
│   │   └── hooks/          # Custom hooks
├── server/                 # Backend Express
│   ├── routes.ts           # Rutas de la API
│   ├── storage.ts          # Capa de datos
│   ├── ai-service.ts       # Servicio de IA
│   └── db.ts              # Configuración de BD
├── shared/                 # Tipos y schemas compartidos
│   └── schema.ts           # Definiciones de base de datos
├── docs/                   # Documentación completa
└── README.md              # Este archivo
```

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+
- PostgreSQL (o cuenta en Neon Database)
- API Key de Google Gemini

### Instalación
```bash
# Clonar el repositorio
git clone [url-del-repositorio]
cd supersetBI

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Ejecutar migraciones de base de datos
npm run db:push

# Iniciar en modo desarrollo
npm run dev
```

### Variables de Entorno
```env
# Base de datos
DATABASE_URL=postgresql://user:password@host:port/database

# API de IA
GEMINI_API_KEY=tu_api_key_de_gemini

# Configuración de sesión
SESSION_SECRET=tu_secreto_de_sesion
```

## 📊 Funcionalidades

### Dashboard
- KPIs en tiempo real
- Gráficos interactivos
- Métricas de rendimiento
- Alertas importantes

### Inventario
- **Análisis ABC**: Clasificación de productos por valor
- **KPIs Avanzados**: Rotación, días de inventario, nivel de servicio
- **Alertas Inteligentes**: Stock bajo, productos vencidos
- **Recomendaciones**: Reabastecimiento automático

### Ventas
- Registro de transacciones
- Análisis de tendencias
- Filtros avanzados
- Segmentación de clientes

### Cobranzas
- Seguimiento de pagos
- Estados de cuentas
- Alertas de vencimiento
- Gestión de clientes

### Asistente de IA
- **Chat Inteligente**: Conversaciones contextuales
- **Análisis de Datos**: Insights automáticos
- **Recomendaciones**: Sugerencias personalizadas
- **Historial Persistente**: Conversaciones guardadas

## 🔐 Seguridad

- **Multi-Tenant**: Aislamiento completo de datos
- **Autenticación**: Sistema de sesiones seguras
- **Autorización**: Control de acceso por roles
- **Validación**: Entrada de datos con Zod
- **HTTPS**: Comunicación encriptada

## 📈 Rendimiento

- **Base de Datos**: PostgreSQL optimizado
- **Cache**: TanStack Query para estado del cliente
- **Build**: Vite con hot reload
- **Producción**: Empaquetado con esbuild

## 🧪 Testing

```bash
# Ejecutar tests
npm run test

# Cobertura de código
npm run test:coverage

# Tests de integración
npm run test:e2e
```

## 📚 Documentación

- [Guía de Instalación](./INSTALACION.md)
- [Arquitectura del Sistema](./ARQUITECTURA.md)
- [API Reference](./API.md)
- [Guía del Asistente IA](./ASISTENTE-IA.md)
- [Base de Datos](./BASE-DE-DATOS.md)

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama para feature (`git checkout -b feature/amazing-feature`)
3. Commit de cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abrir Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para detalles.

## 📞 Soporte

Para soporte técnico o consultas:
- 📧 Email: soporte@supersetbi.com
- 💬 Chat: Usa el asistente de IA integrado
- 📖 Docs: Revisa la documentación completa

---

**SupersetBI** - Inteligencia de Negocios con IA 🚀