# Resumen General

**supersetBI** es una aplicación completa de Business Intelligence (BI) construida con arquitectura full-stack. El sistema proporciona análisis empresariales integrales que incluyen gestión de inventario, seguimiento de ventas, gestión de cobranzas y consultoría empresarial avanzada con IA. Cuenta con un frontend moderno en React con componentes shadcn/ui y un backend Express.js con integración completa de base de datos PostgreSQL utilizando Drizzle ORM para almacenamiento persistente de datos. La aplicación ahora incluye un asistente de IA sofisticado con historial de chat persistente para obtener insights empresariales inteligentes y recomendaciones.

# Preferencias del Usuario

Estilo de comunicación preferido: Lenguaje simple y cotidiano.
Todas las respuestas deben estar en **ESPAÑOL**.

# Arquitectura del Sistema

## Arquitectura Frontend
- **Framework**: React con TypeScript, usando Vite.
- **Librería de UI**: Componentes shadcn/ui construidos sobre Radix UI.
- **Estilos**: Tailwind CSS con tokens de diseño personalizados.
- **Gestión de Estado**: TanStack Query para estado del servidor.
- **Enrutamiento**: Wouter.
- **Gráficos**: Recharts para visualización de datos.

## Arquitectura Backend
- **Framework**: Express.js con TypeScript.
- **Runtime**: Node.js con módulos ESM.
- **Diseño de API**: API RESTful.
- **Build**: esbuild para empaquetado de producción.

## Estrategia de Almacenamiento de Datos
- **Implementación en Producción**: Base de datos PostgreSQL usando la plataforma serverless Neon Database.
- **Clase DatabaseStorage**: Implementación completa con todas las operaciones CRUD para datos multi-tenant.
- **Arquitectura Multi-Tenant**: Aislamiento de datos por empresa usando `companyId` para todos los datos empresariales.
- **Persistencia de Datos**: Todos los datos persisten entre reinicios del servidor y despliegues.
- **Base de Datos del Sistema de Chat IA**: Tablas dedicadas `chat_conversations` y `chat_messages` con persistencia completa.
- **Gestión de Esquemas**: Definiciones de esquemas centralizadas en carpeta compartida con relaciones multi-tenant y seguridad de tipos.
- **Esquema de Conversaciones de Chat**: Diseño relacional completo con gestión de conversaciones, seguimiento de mensajes y conteo de tokens.

## Autenticación y Seguridad
- **Gestión de Sesiones**: Connect-pg-simple para sesiones respaldadas por PostgreSQL.
- **Seguridad de Tipos**: Tipos TypeScript compartidos entre frontend y backend.
- **Validación de Entrada**: Drizzle-zod para validación de esquemas en tiempo de ejecución.
- **Aislamiento de Datos**: Seguridad multi-tenant con acceso a datos por empresa.

## Estructura de Módulos
La aplicación está organizada en módulos empresariales distintos con soporte multi-tenant y filtrado avanzado:
- **Dashboard**: Vista ejecutiva y KPIs.
- **Inventario**: Gestión de productos con KPIs, análisis ABC, alertas, recomendaciones y filtrado avanzado.
- **Cobranzas**: Seguimiento de pagos y gestión de clientes.
- **Ventas**: Registro de transacciones y análisis de ventas.
- **Gestión de Empresas**: Administración multi-tenant, gestión de usuarios e invitaciones.
- **Gestión de Datos**: Importación de datos (CSV/Excel) con descargas de plantillas y validación de archivos.

## Características Avanzadas
- **Asistente de IA**: Asistente integral de business intelligence impulsado por IA usando el modelo Google Gemini 2.5 Flash con:
  - Historial persistente de conversaciones de chat almacenado en PostgreSQL
  - Integración de datos empresariales en tiempo real (inventario, ventas, cobranzas)
  - Formato avanzado de mensajes en markdown con control de desbordamiento
  - Aislamiento de conversaciones multi-tenant con contexto de empresa
  - Optimización de tokens a través de gestión del historial de conversaciones
  - UI profesional con gestión de conversaciones (crear, cargar, eliminar conversaciones)
  - Respuestas conscientes del contexto basadas en métricas empresariales actuales e datos históricos
- **Filtrado Avanzado de Datos**: Motor de filtrado integral con tipos dinámicos y segmentación inteligente entre módulos.
- **Gestión Multi-Empresa/Tenant**: Aislamiento completo de tenants con creación de empresas, roles de usuario (super_admin, company_admin, manager, user, viewer) y sistema de invitaciones.
- **Características Avanzadas de Inventario**: KPIs (ROI, rotación, nivel de servicio, días de inventario, índice de liquidez), alertas inteligentes, recomendaciones inteligentes y análisis ABC.
- **Diseño Responsivo Móvil**: Completamente responsivo en todos los módulos y tamaños de pantalla.

# Dependencias Externas

## IA y Aprendizaje Automático
- **Google Gemini AI 2.5 Flash**: Modelo de lenguaje avanzado para análisis de business intelligence e IA conversacional.
- **Integración de Datos en Tiempo Real**: El asistente de IA tiene acceso directo a datos empresariales en vivo para respuestas contextuales.
- **Gestión de Conversaciones**: Persistencia completa del historial de chat con integración PostgreSQL.
- **Optimización de Tokens**: Seguimiento inteligente de conversaciones para reducir costos de API y mejorar la calidad de respuestas.
- **Procesamiento de Contexto Empresarial**: La IA analiza niveles de inventario, patrones de ventas y estado de cobranzas para insights personalizados.

## Base de Datos y ORM
- **Neon Database**: Base de datos PostgreSQL serverless utilizada activamente en producción con persistencia completa de datos.
- **Drizzle ORM**: Toolkit de base de datos con seguridad de tipos con dialecto PostgreSQL completamente implementado.
- **Drizzle Kit**: Herramientas de migración y gestión de base de datos desplegadas en producción.
- **Tablas del Sistema de Chat**: Esquema dedicado para persistencia de conversaciones de IA con tablas `chat_conversations` y `chat_messages`.
- **Base de Datos Multi-Tenant**: Todas las tablas incluyen aislamiento por empresa para operaciones multi-tenant seguras.

## UI y Estilos
- **Radix UI**: Primitivas de UI de bajo nivel.
- **Tailwind CSS**: Framework CSS utility-first.
- **Recharts**: Librería de gráficos para visualización de datos.
- **Lucide React**: Librería de iconos.

## Herramientas de Desarrollo
- **Vite**: Herramienta de build con HMR.
- **TypeScript**: Verificación de tipos estática.
- **ESBuild**: Empaquetador de JavaScript rápido.

## Librerías Utilitarias
- **TanStack Query**: Sincronización y caché de estado del servidor.
- **date-fns**: Manipulación de fechas.
- **clsx/tailwind-merge**: Composición dinámica de className.
- **wouter**: Solución de enrutamiento mínima.
- **Google Gemini API (@google/genai)**: Implementación completa del asistente de IA con capacidades de business intelligence.
- **Capa de Servicio de IA**: Análisis integral de datos empresariales, insights de inventario e IA conversacional.
- **Procesamiento Consciente del Contexto**: Integración en tiempo real con datos empresariales para respuestas de IA personalizadas.