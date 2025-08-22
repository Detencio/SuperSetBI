# Configuración de Base de Datos - SupersetBI

## 🎯 Guía Paso a Paso para Migrar de In-Memory a PostgreSQL

### Estado Actual
- ✅ **In-Memory Storage**: Sistema funcional para desarrollo
- ✅ **Esquemas Drizzle**: Completamente definidos y listos
- ✅ **APIs Preparadas**: Endpoints compatibles con ambos sistemas
- 🔄 **Migración Pendiente**: Cambio a PostgreSQL

---

## 📋 Pasos para Migración a Base de Datos

### Paso 1: Configurar PostgreSQL

#### Opción A: PostgreSQL Local
```bash
# 1. Instalar PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# 2. Iniciar servicio
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 3. Crear base de datos
sudo -u postgres psql
```

```sql
-- En consola PostgreSQL
CREATE DATABASE supersetbi;
CREATE USER supersetbi_user WITH ENCRYPTED PASSWORD 'tu_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE supersetbi TO supersetbi_user;
GRANT ALL ON SCHEMA public TO supersetbi_user;
\q
```

#### Opción B: Neon Database (Recomendado)
1. Ir a [neon.tech](https://neon.tech)
2. Crear cuenta gratuita
3. Crear nuevo proyecto "SupersetBI"
4. Copiar string de conexión

### Paso 2: Configurar Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
# Base de Datos
DATABASE_URL=postgresql://username:password@host:5432/database
PGHOST=tu-host.neon.tech
PGDATABASE=supersetbi
PGUSER=tu_usuario
PGPASSWORD=tu_password
PGPORT=5432

# Aplicación
NODE_ENV=development
PORT=5000

# Para Neon Database específicamente
PGSSL=true
```

### Paso 3: Ejecutar Migraciones

```bash
# 1. Generar archivos de migración
npx drizzle-kit generate:pg

# 2. Aplicar migraciones a la base de datos
npx drizzle-kit push:pg

# 3. Verificar esquemas (opcional)
npx drizzle-kit studio
```

### Paso 4: Modificar Código para Usar PostgreSQL

#### Actualizar `server/storage.ts`:

```typescript
// Cambiar de MemStorage a PostgreSQL
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// Reemplazar todas las implementaciones MemStorage con queries reales
export const storage: IStorage = {
  async getProducts() {
    return await db.select().from(products);
  },
  
  async createProduct(product) {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  },
  
  // ... implementar resto de métodos
};
```

### Paso 5: Verificar Funcionamiento

```bash
# 1. Reiniciar aplicación
npm run dev

# 2. Probar endpoints
curl http://localhost:5000/api/products
curl http://localhost:5000/api/inventory/analytics

# 3. Verificar en Drizzle Studio
npx drizzle-kit studio
```

---

## 🧪 Script de Migración de Datos

Crear archivo `scripts/migrate-data.ts`:

```typescript
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { products, categories, suppliers } from '../shared/schema';
import { mockData } from '../client/src/lib/mock-data';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function migrateData() {
  console.log('🔄 Iniciando migración de datos...');
  
  try {
    // 1. Migrar categorías
    console.log('📂 Migrando categorías...');
    const categoryData = [
      { name: 'Premium', description: 'Productos premium de alta calidad' },
      { name: 'Estándar', description: 'Productos de línea regular' },
      { name: 'Económico', description: 'Productos de precio accesible' },
      { name: 'Electrónicos', description: 'Dispositivos y componentes electrónicos' }
    ];
    
    await db.insert(categories).values(categoryData);
    console.log('✅ Categorías migradas');
    
    // 2. Migrar productos
    console.log('📦 Migrando productos...');
    await db.insert(products).values(mockData.products);
    console.log('✅ Productos migrados');
    
    // 3. Migrar proveedores
    console.log('🏢 Migrando proveedores...');
    const supplierData = [
      {
        name: 'Proveedor Premium SA',
        contactEmail: 'ventas@premium.com',
        contactPhone: '+52 55 1234 5678',
        address: 'Av. Reforma 123, CDMX'
      },
      {
        name: 'Distribuidora Nacional',
        contactEmail: 'contacto@disnacional.com',
        contactPhone: '+52 33 9876 5432',
        address: 'Zona Industrial, Guadalajara'
      }
    ];
    
    await db.insert(suppliers).values(supplierData);
    console.log('✅ Proveedores migrados');
    
    console.log('🎉 Migración completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  }
}

// Ejecutar migración
if (require.main === module) {
  migrateData().then(() => process.exit(0));
}

export { migrateData };
```

Ejecutar migración:
```bash
npx tsx scripts/migrate-data.ts
```

---

## 🔧 Scripts de Utilidad

### Crear `package.json` scripts:

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate:pg",
    "db:migrate": "drizzle-kit push:pg",
    "db:studio": "drizzle-kit studio",
    "db:seed": "tsx scripts/migrate-data.ts",
    "db:reset": "tsx scripts/reset-database.ts",
    "db:backup": "pg_dump $DATABASE_URL > backup.sql"
  }
}
```

### Script de Reset (opcional)

Crear `scripts/reset-database.ts`:

```typescript
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { products, categories, suppliers, purchaseOrders, inventoryMovements } from '../shared/schema';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function resetDatabase() {
  console.log('🗑️  Limpiando base de datos...');
  
  try {
    await db.delete(inventoryMovements);
    await db.delete(purchaseOrders);
    await db.delete(products);
    await db.delete(suppliers);
    await db.delete(categories);
    
    console.log('✅ Base de datos limpiada');
    
    // Reiniciar secuencias si es necesario
    await sql`ALTER SEQUENCE products_id_seq RESTART WITH 1`;
    await sql`ALTER SEQUENCE categories_id_seq RESTART WITH 1`;
    await sql`ALTER SEQUENCE suppliers_id_seq RESTART WITH 1`;
    
    console.log('✅ Secuencias reiniciadas');
    
  } catch (error) {
    console.error('❌ Error al limpiar base de datos:', error);
  }
}

if (require.main === module) {
  resetDatabase().then(() => process.exit(0));
}
```

---

## ✅ Checklist de Migración

### Pre-Migración
- [ ] PostgreSQL instalado y configurado
- [ ] Variables de entorno configuradas
- [ ] Backup de datos actuales (si aplica)
- [ ] Drizzle Kit instalado

### Migración
- [ ] Esquemas generados (`npm run db:generate`)
- [ ] Migraciones aplicadas (`npm run db:migrate`)
- [ ] Datos migrados (`npm run db:seed`)
- [ ] Storage actualizado para usar PostgreSQL

### Post-Migración
- [ ] Aplicación reiniciada
- [ ] APIs funcionando correctamente
- [ ] KPIs mostrando datos reales
- [ ] Alertas generándose apropiadamente
- [ ] Performance verificada

### Testing
- [ ] Todos los endpoints responden
- [ ] CRUD operations funcionan
- [ ] Filtros y búsquedas operativos
- [ ] Cálculos de KPIs correctos

---

## 🚨 Rollback Plan

Si algo sale mal durante la migración:

1. **Restaurar código anterior**:
```bash
git checkout HEAD~1 server/storage.ts
```

2. **Volver a in-memory storage**:
```typescript
// En server/storage.ts, usar MemStorage temporalmente
export const storage = new MemStorage();
```

3. **Reiniciar aplicación**:
```bash
npm run dev
```

---

## 📞 Soporte Durante Migración

### Verificación de Conexión
```bash
# Probar conexión a PostgreSQL
psql $DATABASE_URL -c "SELECT version();"

# Verificar tablas creadas
psql $DATABASE_URL -c "\dt"
```

### Logs Útiles
```bash
# Ver logs de aplicación
npm run dev -- --verbose

# Logs de Drizzle (agregar en código)
const db = drizzle(sql, { logger: true });
```

### Comandos de Emergencia
```bash
# Restaurar backup
psql $DATABASE_URL < backup.sql

# Verificar integridad de datos
npm run db:studio
```

---

*Guía creada para SupersetBI - Migración a PostgreSQL*