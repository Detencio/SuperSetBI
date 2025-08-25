# Guía de Instalación - SupersetBI

Esta guía te llevará paso a paso para instalar y configurar SupersetBI en tu entorno.

## 📋 Prerrequisitos

### Software Requerido
- **Node.js**: v18.0 o superior
- **npm**: v8.0 o superior (viene con Node.js)
- **Git**: Para clonar el repositorio

### Servicios Externos
- **PostgreSQL**: Base de datos (recomendado: Neon Database)
- **Google Gemini API**: Para funcionalidades de IA

## 🚀 Instalación Paso a Paso

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/supersetBI.git
cd supersetBI
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno (.env)

Crea un archivo `.env` en la raíz del proyecto (el servidor lo carga automáticamente con dotenv):

```env
# === BASE DE DATOS ===
DATABASE_URL=postgresql://usuario:password@host:puerto/database

# Variables específicas de PostgreSQL (automáticas con Neon)
PGHOST=tu-host.neon.tech
PGPORT=5432
PGUSER=tu-usuario
PGPASSWORD=tu-password
PGDATABASE=nombre-database

# === INTELIGENCIA ARTIFICIAL ===
GEMINI_API_KEY=tu_api_key_de_google_gemini

# === SEGURIDAD ===
SESSION_SECRET=tu_secreto_de_sesion_muy_seguro
NODE_ENV=development

# === CONFIGURACIÓN DE APLICACIÓN ===
PORT=5000
```

### 4. Configurar Base de Datos

#### Opción A: Usando Neon Database (Recomendado)

1. Crear cuenta en [Neon Database](https://neon.tech)
2. Crear un nuevo proyecto
3. Copiar la URL de conexión
4. Agregar la URL a `DATABASE_URL` en `.env`

#### Opción B: PostgreSQL Local

1. Instalar PostgreSQL en tu sistema
2. Crear una base de datos:
```sql
CREATE DATABASE supersetbi;
```
3. Configurar la URL de conexión en `.env`

### 5. Ejecutar Migraciones

```bash
# Generar y aplicar esquema a la base de datos
npm run db:generate
npm run db:push

# Verificar conexión
npm run db:studio
```

### 6. Obtener API Key de Google Gemini

1. Ir a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crear una nueva API key
3. Copiar la key al archivo `.env`

### 7. Iniciar la Aplicación (Windows y macOS/Linux)

```bash
# Modo desarrollo (usa cross-env para Windows y carga .env automáticamente)
npm run dev

# Modo producción
npm run build
npm start
```

## 🔧 Configuración Avanzada

### Configuración de Base de Datos

El archivo `drizzle.config.ts` contiene la configuración de la base de datos:

```typescript
import type { Config } from "drizzle-kit";

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

### Variables de Entorno Detalladas

```env
# === BASE DE DATOS ===
DATABASE_URL=postgresql://usuario:password@host:puerto/database
PGHOST=host-de-postgresql
PGPORT=5432
PGUSER=usuario
PGPASSWORD=password
PGDATABASE=nombre_base_datos

# === INTELIGENCIA ARTIFICIAL ===
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-2.5-flash

# === AUTENTICACIÓN Y SEGURIDAD ===
SESSION_SECRET=secreto-muy-seguro-de-al-menos-32-caracteres
SESSION_TIMEOUT=24h

# === CONFIGURACIÓN DE APLICACIÓN ===
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5000
API_BASE_URL=http://localhost:5000/api

# === CONFIGURACIÓN DE LOGS ===
LOG_LEVEL=info
```

## 🐳 Instalación con Docker (Opcional)

### 1. Crear Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

### 2. Docker Compose
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - SESSION_SECRET=${SESSION_SECRET}
    depends_on:
      - postgres

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=supersetbi
      - POSTGRES_USER=usuario
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### 3. Ejecutar con Docker
```bash
docker-compose up -d
```

## 🔍 Verificación de Instalación

### 1. Verificar Servicios
```bash
# Verificar conexión a base de datos
npm run db:check

# Verificar API de IA
curl -H "Authorization: Bearer $GEMINI_API_KEY" \
     https://generativelanguage.googleapis.com/v1/models
```

### 2. Ejecutar Tests
```bash
# Tests unitarios
npm run test

# Tests de integración
npm run test:integration

# Tests end-to-end
npm run test:e2e
```

### 3. Verificar Funcionalidades

1. **Frontend**: Acceder a `http://localhost:5000`
2. **API**: Verificar `http://localhost:5000/api/health`
3. **Base de datos**: Usar `npm run db:studio`
4. **Asistente IA**: Probar chat en la interfaz

## ❗ Solución de Problemas

### Error: "Cannot connect to database"
```bash
# Verificar variables de entorno
echo $DATABASE_URL

# Probar conexión manual
psql $DATABASE_URL

# Verificar firewall y red
```

### Error: "GEMINI_API_KEY not found"
```bash
# Verificar que la variable está configurada
echo $GEMINI_API_KEY

# Verificar formato de la key
# Debe comenzar con AIzaSy...
```

### Error: "Port 5000 already in use"
```bash
# Cambiar puerto en .env
PORT=3000

# O matar proceso existente
lsof -ti:5000 | xargs kill -9
```

### Error: "Schema sync failed"
```bash
# Regenerar schema
npm run db:generate

# Aplicar cambios
npm run db:push --force

# Verificar estado
npm run db:check
```

## 📊 Datos de Prueba

Para cargar datos de demostración:

```bash
# Cargar datos de prueba
npm run seed

# Crear usuario administrador
npm run create-admin

# Cargar empresa demo
npm run setup-demo
```

## 🔄 Actualizaciones

### Actualizar Dependencias
```bash
# Verificar actualizaciones
npm outdated

# Actualizar packages
npm update

# Actualizar a versiones mayores
npx npm-check-updates -u
npm install
```

### Migrar Base de Datos
```bash
# Generar nueva migración
npm run db:generate

# Aplicar migraciones
npm run db:push

# Rollback si es necesario
npm run db:rollback
```

## 🚀 Despliegue en Producción

Ver la guía de [Despliegue en Producción](./DESPLIEGUE.md) para instrucciones detalladas.

## 📞 Soporte

Si encuentras problemas durante la instalación:

1. Revisa los [Issues conocidos](../issues)
2. Consulta la [documentación completa](./README.md)
3. Contacta soporte: soporte@supersetbi.com

---

¡Felicitaciones! 🎉 SupersetBI está listo para usar.