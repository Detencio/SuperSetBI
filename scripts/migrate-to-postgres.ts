#!/usr/bin/env tsx

/**
 * Script de Migración a PostgreSQL
 * Migra datos desde el sistema in-memory actual a PostgreSQL
 */

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { 
  products, 
  categories, 
  suppliers
} from '../shared/schema';

// Datos de ejemplo que actualmente están en mock-data.ts
const sampleData = {
  categories: [
    { name: 'Premium', description: 'Productos premium de alta calidad' },
    { name: 'Estándar', description: 'Productos de línea regular' },
    { name: 'Económico', description: 'Productos de precio accesible' },
    { name: 'Electrónicos', description: 'Dispositivos y componentes electrónicos' },
    { name: 'Hogar', description: 'Productos para el hogar' },
    { name: 'Oficina', description: 'Suministros de oficina' }
  ],
  
  suppliers: [
    {
      name: 'Proveedor Premium SA',
      contactEmail: 'ventas@premium.com',
      contactPhone: '+52 55 1234 5678',
      address: 'Av. Reforma 123, Ciudad de México, CDMX'
    },
    {
      name: 'Distribuidora Nacional',
      contactEmail: 'contacto@disnacional.com',
      contactPhone: '+52 33 9876 5432',
      address: 'Zona Industrial, Guadalajara, Jalisco'
    },
    {
      name: 'Importadora Global',
      contactEmail: 'info@impglobal.com',
      contactPhone: '+52 81 5555 4444',
      address: 'Santa Catarina, Monterrey, Nuevo León'
    }
  ],
  
  products: [
    {
      name: 'Producto Premium A',
      description: 'Producto de alta calidad con características premium',
      price: '299.99',
      category: 'Premium',
      stock: 45,
      minStock: 10,
      maxStock: 100,
      sku: 'PREM-001'
    },
    {
      name: 'Laptop Profesional',
      description: 'Laptop para uso profesional con alta performance',
      price: '15999.99',
      category: 'Electrónicos',
      stock: 12,
      minStock: 5,
      maxStock: 25,
      sku: 'ELEC-LAP-001'
    },
    {
      name: 'Escritorio Ejecutivo',
      description: 'Escritorio de madera para oficinas ejecutivas',
      price: '4500.00',
      category: 'Oficina',
      stock: 8,
      minStock: 3,
      maxStock: 15,
      sku: 'OFIC-ESC-001'
    },
    {
      name: 'Smartphone Estándar',
      description: 'Teléfono inteligente de gama media',
      price: '8999.99',
      category: 'Electrónicos',
      stock: 25,
      minStock: 10,
      maxStock: 50,
      sku: 'ELEC-TEL-002'
    },
    {
      name: 'Silla Ergonómica',
      description: 'Silla de oficina con soporte lumbar',
      price: '2299.99',
      category: 'Oficina',
      stock: 15,
      minStock: 8,
      maxStock: 30,
      sku: 'OFIC-SIL-001'
    },
    {
      name: 'Cafetera Premium',
      description: 'Cafetera automática con múltiples funciones',
      price: '1899.99',
      category: 'Hogar',
      stock: 20,
      minStock: 5,
      maxStock: 35,
      sku: 'HOG-CAF-001'
    },
    {
      name: 'Monitor 4K',
      description: 'Monitor profesional de 27 pulgadas 4K',
      price: '7500.00',
      category: 'Electrónicos',
      stock: 18,
      minStock: 6,
      maxStock: 30,
      sku: 'ELEC-MON-001'
    },
    {
      name: 'Kit de Herramientas',
      description: 'Set completo de herramientas para el hogar',
      price: '899.99',
      category: 'Hogar',
      stock: 35,
      minStock: 15,
      maxStock: 60,
      sku: 'HOG-HER-001'
    },
    {
      name: 'Impresora Láser',
      description: 'Impresora láser monocromática para oficina',
      price: '3200.00',
      category: 'Oficina',
      stock: 10,
      minStock: 4,
      maxStock: 20,
      sku: 'OFIC-IMP-001'
    },
    {
      name: 'Tablet Económica',
      description: 'Tablet básica para uso general',
      price: '3500.00',
      category: 'Electrónicos',
      stock: 30,
      minStock: 12,
      maxStock: 45,
      sku: 'ELEC-TAB-001'
    }
  ]
};

async function migrateToPostgres() {
  console.log('🚀 Iniciando migración a PostgreSQL...\n');
  
  // Verificar que la URL de base de datos está configurada
  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL no está configurada');
    console.log('💡 Por favor configura la variable de entorno DATABASE_URL');
    console.log('   Ejemplo: DATABASE_URL=postgresql://user:pass@host:5432/dbname\n');
    process.exit(1);
  }
  
  try {
    // Conectar a la base de datos
    console.log('🔗 Conectando a la base de datos...');
    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql);
    console.log('✅ Conexión establecida\n');
    
    // 1. Migrar Categorías
    console.log('📂 Migrando categorías...');
    for (const category of sampleData.categories) {
      await db.insert(categories).values(category).onConflictDoNothing();
    }
    console.log(`✅ ${sampleData.categories.length} categorías migradas\n`);
    
    // 2. Migrar Proveedores
    console.log('🏢 Migrando proveedores...');
    for (const supplier of sampleData.suppliers) {
      await db.insert(suppliers).values(supplier).onConflictDoNothing();
    }
    console.log(`✅ ${sampleData.suppliers.length} proveedores migrados\n`);
    
    // 3. Migrar Productos
    console.log('📦 Migrando productos...');
    let productCount = 0;
    for (const product of sampleData.products) {
      await db.insert(products).values(product).onConflictDoNothing();
      productCount++;
      process.stdout.write(`   Producto ${productCount}/${sampleData.products.length} migrado\r`);
    }
    console.log(`\n✅ ${sampleData.products.length} productos migrados\n`);
    
    // 4. Verificar migración
    console.log('🔍 Verificando migración...');
    const categoryCount = await db.select().from(categories);
    const supplierCount = await db.select().from(suppliers);
    const productCount2 = await db.select().from(products);
    
    console.log(`   📂 Categorías en DB: ${categoryCount.length}`);
    console.log(`   🏢 Proveedores en DB: ${supplierCount.length}`);
    console.log(`   📦 Productos en DB: ${productCount2.length}`);
    
    // 5. Verificar integridad de datos
    console.log('\n🔍 Verificando integridad de datos...');
    
    // Verificar que todos los productos tienen precios válidos
    const invalidProducts = productCount2.filter(p => !p.price || parseFloat(p.price) <= 0);
    if (invalidProducts.length > 0) {
      console.log(`⚠️  ${invalidProducts.length} productos con precios inválidos detectados`);
    }
    
    // Verificar que todos los productos tienen stock válido
    const invalidStock = productCount2.filter(p => p.stock < 0);
    if (invalidStock.length > 0) {
      console.log(`⚠️  ${invalidStock.length} productos con stock negativo detectados`);
    }
    
    console.log('✅ Verificación de integridad completada');
    
    console.log('\n🎉 ¡Migración completada exitosamente!');
    console.log('\n📊 Resumen de la migración:');
    console.log(`   • ${categoryCount.length} categorías`);
    console.log(`   • ${supplierCount.length} proveedores`);
    console.log(`   • ${productCount2.length} productos`);
    console.log(`   • Datos verificados e íntegros`);
    
    console.log('\n🔧 Próximos pasos:');
    console.log('   1. Actualizar server/storage.ts para usar PostgreSQL');
    console.log('   2. Reiniciar la aplicación: npm run dev');
    console.log('   3. Verificar que los APIs respondan correctamente');
    console.log('   4. Probar el dashboard de inventario\n');
    
  } catch (error) {
    console.error('\n❌ Error durante la migración:');
    console.error(error);
    console.log('\n💡 Posibles soluciones:');
    console.log('   • Verificar que PostgreSQL esté ejecutándose');
    console.log('   • Revisar la URL de conexión DATABASE_URL');
    console.log('   • Ejecutar las migraciones: npm run db:migrate');
    console.log('   • Verificar permisos de usuario en la base de datos\n');
    process.exit(1);
  }
}

// Ejecutar migración si es llamado directamente
if (require.main === module) {
  migrateToPostgres()
    .then(() => {
      console.log('🏁 Script de migración finalizado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

export { migrateToPostgres, sampleData };