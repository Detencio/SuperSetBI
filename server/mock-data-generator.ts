// Generador de datos de prueba para un año completo
import { randomUUID } from 'crypto';

// Datos base para generar productos realistas
const PRODUCT_CATEGORIES = [
  'Electrónicos', 'Ropa y Accesorios', 'Hogar y Jardín', 'Deportes', 
  'Salud y Belleza', 'Alimentación', 'Automotriz', 'Ferretería',
  'Oficina y Papelería', 'Juguetes y Games'
];

const PRODUCT_NAMES = {
  'Electrónicos': [
    'Smartphone Premium', 'Laptop Profesional', 'Tablet 10"', 'Auriculares Bluetooth',
    'Smart TV 55"', 'Cámara Digital', 'Parlante Portátil', 'Smartwatch',
    'Cargador Inalámbrico', 'Mouse Gamer'
  ],
  'Ropa y Accesorios': [
    'Polera Básica', 'Jeans Premium', 'Chaqueta Invierno', 'Zapatillas Deportivas',
    'Vestido Casual', 'Camisa Formal', 'Pantalón Chino', 'Bufanda Lana',
    'Cinturón Cuero', 'Gorra Deportiva'
  ],
  'Hogar y Jardín': [
    'Aspiradora Robot', 'Cafetera Express', 'Juego Sábanas', 'Planta Decorativa',
    'Lámpara LED', 'Organizador Closet', 'Macetero Cerámica', 'Cortina Blackout',
    'Alfombra Sala', 'Espejo Decorativo'
  ],
  'Deportes': [
    'Pelota Fútbol', 'Raqueta Tenis', 'Bicicleta MTB', 'Pesas Ajustables',
    'Colchoneta Yoga', 'Guantes Boxeo', 'Cuerda Saltar', 'Barra Pull-up',
    'Botella Termo', 'Mancuernas 5kg'
  ],
  'Salud y Belleza': [
    'Crema Hidratante', 'Champú Premium', 'Perfume Unisex', 'Protector Solar',
    'Vitamina C', 'Máscara Facial', 'Cepillo Dental Eléctrico', 'Aceite Esencial',
    'Suplemento Proteína', 'Kit Manicure'
  ],
  'Alimentación': [
    'Café Premium', 'Miel Orgánica', 'Aceite Oliva', 'Quinoa 1kg',
    'Frutos Secos Mix', 'Té Verde', 'Chocolate 70%', 'Pasta Integral',
    'Mermelada Artesanal', 'Granola Casera'
  ],
  'Automotriz': [
    'Aceite Motor', 'Neumático 15"', 'Batería Auto', 'Filtro Aire',
    'Limpia Parabrisas', 'Kit Herramientas', 'Cargador 12V', 'Alfombra Auto',
    'Ambientador', 'Cables Batería'
  ],
  'Ferretería': [
    'Taladro Percutor', 'Martillo Carpintero', 'Destornillador Set', 'Nivel Láser',
    'Cinta Métrica', 'Alicate Universal', 'Sierra Manual', 'Tornillos Madera',
    'Pegamento Universal', 'Lija Grano 120'
  ],
  'Oficina y Papelería': [
    'Resma Papel A4', 'Bolígrafos Pack', 'Carpeta Archivador', 'Calculadora Científica',
    'Grapadora Heavy Duty', 'Marcadores Colores', 'Agenda 2024', 'Clips Metálicos',
    'Pegamento Stick', 'Cuaderno Universitario'
  ],
  'Juguetes y Games': [
    'Puzzle 1000 Piezas', 'Muñeca Articulada', 'Carro Control Remoto', 'Juego Mesa',
    'Peluche Oso', 'Bloques Construcción', 'Pelota Inflable', 'Kit Ciencias',
    'Rompecabezas 3D', 'Fichas Ajedrez'
  ]
};

const CUSTOMER_NAMES = [
  'Juan Pérez', 'María González', 'Carlos Rodríguez', 'Ana Martínez', 'Luis López',
  'Carmen Sánchez', 'José Ramírez', 'Laura Torres', 'Miguel Flores', 'Isabel Ruiz',
  'David Morales', 'Patricia Jiménez', 'Roberto Herrera', 'Elena Castro', 'Fernando Silva',
  'Mónica Vargas', 'Alejandro Mendoza', 'Beatriz Aguilar', 'Raúl Delgado', 'Sofía Vega'
];

const CUSTOMER_EMAILS = [
  'juan.perez@email.com', 'maria.gonzalez@email.com', 'carlos.rodriguez@email.com',
  'ana.martinez@email.com', 'luis.lopez@email.com', 'carmen.sanchez@email.com',
  'jose.ramirez@email.com', 'laura.torres@email.com', 'miguel.flores@email.com',
  'isabel.ruiz@email.com', 'david.morales@email.com', 'patricia.jimenez@email.com',
  'roberto.herrera@email.com', 'elena.castro@email.com', 'fernando.silva@email.com',
  'monica.vargas@email.com', 'alejandro.mendoza@email.com', 'beatriz.aguilar@email.com',
  'raul.delgado@email.com', 'sofia.vega@email.com'
];

const SALESPERSON_NAMES = [
  'Andrea Muñoz', 'Diego Castillo', 'Valentina Rojas', 'Matías Espinoza', 'Francisca Pavez'
];

// Utilidades para generar datos aleatorios
const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

const getRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomFloat = (min: number, max: number, decimals: number = 2): number => {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
};

const getRandomDate = (startDate: Date, endDate: Date): Date => {
  const start = startDate.getTime();
  const end = endDate.getTime();
  return new Date(start + Math.random() * (end - start));
};

// Generar productos para el inventario
export const generateProducts = (count: number = 100) => {
  const products = [];
  
  for (let i = 0; i < count; i++) {
    const category = getRandomElement(PRODUCT_CATEGORIES);
    const productNames = PRODUCT_NAMES[category as keyof typeof PRODUCT_NAMES];
    const name = getRandomElement(productNames);
    
    const unitCost = getRandomFloat(5000, 150000, 0); // Entre $5.000 y $150.000 CLP
    const salePrice = Math.round(unitCost * getRandomFloat(1.3, 2.5)); // Margen 30% a 150%
    const minStock = getRandomNumber(5, 20);
    const maxStock = minStock * getRandomNumber(3, 8);
    const currentStock = getRandomNumber(0, maxStock + 10);
    
    products.push({
      id: randomUUID(),
      name: `${name} ${i + 1}`,
      sku: `SKU-${category.substring(0, 3).toUpperCase()}-${String(i + 1).padStart(4, '0')}`,
      category,
      unitCost,
      salePrice,
      currentStock,
      minStock,
      maxStock,
      description: `${name} de alta calidad para uso ${category.toLowerCase()}`,
      supplier: `Proveedor ${getRandomElement(['A', 'B', 'C', 'D', 'E'])}`,
      barcode: `${getRandomNumber(1000000000000, 9999999999999)}`,
      location: `Pasillo ${getRandomNumber(1, 10)}-${getRandomNumber(1, 50)}`,
      lastUpdated: new Date().toISOString()
    });
  }
  
  return products;
};

// Generar ventas para todo el año
export const generateSales = (products: any[], count: number = 2000) => {
  const sales = [];
  const startDate = new Date('2024-01-01');
  const endDate = new Date('2024-12-31');
  
  for (let i = 0; i < count; i++) {
    const product = getRandomElement(products);
    const quantity = getRandomNumber(1, 10);
    const pricePerUnit = product.salePrice * getRandomFloat(0.9, 1.1); // Variación de precio
    const totalAmount = quantity * pricePerUnit;
    const customerIndex = getRandomNumber(0, CUSTOMER_NAMES.length - 1);
    
    sales.push({
      id: randomUUID(),
      productId: product.id,
      quantity,
      pricePerUnit,
      totalAmount,
      customerName: CUSTOMER_NAMES[customerIndex],
      customerEmail: CUSTOMER_EMAILS[customerIndex],
      salesperson: getRandomElement(SALESPERSON_NAMES),
      saleDate: getRandomDate(startDate, endDate).toISOString(),
      status: getRandomElement(['completed', 'pending', 'cancelled']),
      notes: Math.random() > 0.7 ? `Venta especial con descuento del ${getRandomNumber(5, 20)}%` : ''
    });
  }
  
  return sales.sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
};

// Generar cobranzas basadas en las ventas
export const generateCollections = (sales: any[]) => {
  const collections = [];
  
  // Solo generar cobranzas para ventas completadas
  const completedSales = sales.filter(s => s.status === 'completed');
  
  for (const sale of completedSales) {
    // 80% de probabilidad de que haya una cobranza pendiente
    if (Math.random() > 0.2) {
      const issueDate = new Date(sale.saleDate);
      const dueDate = new Date(issueDate);
      dueDate.setDate(dueDate.getDate() + getRandomNumber(15, 60)); // 15 a 60 días de plazo
      
      const amount = sale.totalAmount;
      let paidAmount = 0;
      let status = 'pending';
      
      // Determinar estado de pago basado en fecha de vencimiento
      const today = new Date();
      const daysSinceIssue = Math.floor((today.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceIssue > 90) {
        // Ventas muy antiguas, mayoría pagadas
        const paymentProbability = Math.random();
        if (paymentProbability > 0.2) {
          status = 'paid';
          paidAmount = amount;
        } else if (paymentProbability > 0.1) {
          status = 'partial';
          paidAmount = amount * getRandomFloat(0.3, 0.8);
        } else {
          status = dueDate < today ? 'overdue' : 'pending';
        }
      } else if (daysSinceIssue > 30) {
        // Ventas medianas
        const paymentProbability = Math.random();
        if (paymentProbability > 0.4) {
          status = 'paid';
          paidAmount = amount;
        } else if (paymentProbability > 0.2) {
          status = 'partial';
          paidAmount = amount * getRandomFloat(0.4, 0.9);
        } else {
          status = dueDate < today ? 'overdue' : 'pending';
        }
      } else {
        // Ventas recientes
        const paymentProbability = Math.random();
        if (paymentProbability > 0.6) {
          status = 'paid';
          paidAmount = amount;
        } else {
          status = dueDate < today ? 'overdue' : 'pending';
        }
      }
      
      const remainingAmount = amount - paidAmount;
      const overdueDays = status === 'overdue' ? 
        Math.max(0, Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))) : 0;
      
      collections.push({
        id: randomUUID(),
        saleId: sale.id,
        customerName: sale.customerName,
        customerEmail: sale.customerEmail,
        amount,
        paidAmount,
        remainingAmount,
        issueDate: issueDate.toISOString(),
        dueDate: dueDate.toISOString(),
        status,
        overdueDays,
        paymentMethod: paidAmount > 0 ? getRandomElement(['transfer', 'cash', 'card', 'cheque']) : null,
        notes: status === 'overdue' ? 
          `Factura vencida hace ${overdueDays} días. Requiere seguimiento.` : 
          status === 'partial' ? 
          `Pago parcial recibido. Pendiente $${Math.round(remainingAmount).toLocaleString('es-CL')}` : ''
      });
    }
  }
  
  return collections.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
};

// Generar eventos de inventario (movimientos, ajustes, etc.)
export const generateInventoryEvents = (products: any[], count: number = 500) => {
  const events = [];
  const startDate = new Date('2024-01-01');
  const endDate = new Date('2024-12-31');
  
  const eventTypes = [
    'purchase', 'sale', 'adjustment', 'return', 'transfer', 'damaged', 'expired'
  ];
  
  for (let i = 0; i < count; i++) {
    const product = getRandomElement(products);
    const eventType = getRandomElement(eventTypes);
    let quantity = getRandomNumber(1, 50);
    let reason = '';
    
    // Ajustar cantidad según tipo de evento
    switch (eventType) {
      case 'purchase':
        quantity = getRandomNumber(10, 100);
        reason = 'Compra a proveedor';
        break;
      case 'sale':
        quantity = -getRandomNumber(1, 20);
        reason = 'Venta a cliente';
        break;
      case 'adjustment':
        quantity = getRandomNumber(-10, 10);
        reason = 'Ajuste por inventario físico';
        break;
      case 'return':
        quantity = getRandomNumber(1, 5);
        reason = 'Devolución de cliente';
        break;
      case 'transfer':
        quantity = -getRandomNumber(1, 15);
        reason = 'Transferencia a otra sucursal';
        break;
      case 'damaged':
        quantity = -getRandomNumber(1, 8);
        reason = 'Producto dañado - baja';
        break;
      case 'expired':
        quantity = -getRandomNumber(1, 5);
        reason = 'Producto vencido - descarte';
        break;
    }
    
    events.push({
      id: randomUUID(),
      productId: product.id,
      eventType,
      quantity,
      unitCost: eventType === 'purchase' ? product.unitCost * getRandomFloat(0.9, 1.1) : product.unitCost,
      reason,
      date: getRandomDate(startDate, endDate).toISOString(),
      userId: getRandomElement(['admin', 'inventory_manager', 'sales_rep']),
      reference: `${eventType.toUpperCase()}-${String(i + 1).padStart(6, '0')}`,
      notes: Math.random() > 0.8 ? 
        `Evento ${eventType} procesado automáticamente por el sistema` : ''
    });
  }
  
  return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Generar alertas de inventario
export const generateInventoryAlerts = (products: any[]) => {
  const alerts = [];
  
  products.forEach(product => {
    const alerts_for_product = [];
    
    // Alerta de stock bajo
    if (product.currentStock <= product.minStock) {
      alerts_for_product.push({
        id: randomUUID(),
        productId: product.id,
        type: 'low_stock',
        priority: product.currentStock === 0 ? 'critical' : 
                 product.currentStock <= product.minStock * 0.5 ? 'high' : 'medium',
        title: product.currentStock === 0 ? 'Producto Agotado' : 'Stock Bajo',
        message: product.currentStock === 0 ? 
          `${product.name} está completamente agotado` :
          `${product.name} tiene stock bajo (${product.currentStock} unidades)`,
        currentStock: product.currentStock,
        minStock: product.minStock,
        recommendedAction: product.currentStock === 0 ? 
          `Reabastecer urgentemente - Stock recomendado: ${product.maxStock} unidades` :
          `Considerar reabastecimiento - Stock mínimo: ${product.minStock} unidades`,
        createdAt: new Date().toISOString(),
        resolved: false
      });
    }
    
    // Alerta de exceso de stock
    if (product.currentStock >= product.maxStock * 1.2) {
      alerts_for_product.push({
        id: randomUUID(),
        productId: product.id,
        type: 'excess_stock',
        priority: 'medium',
        title: 'Exceso de Stock',
        message: `${product.name} tiene exceso de stock (${product.currentStock} unidades)`,
        currentStock: product.currentStock,
        maxStock: product.maxStock,
        recommendedAction: `Considerar promociones o liquidación - Stock máximo recomendado: ${product.maxStock} unidades`,
        createdAt: new Date().toISOString(),
        resolved: false
      });
    }
    
    alerts.push(...alerts_for_product);
  });
  
  return alerts.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority as keyof typeof priorityOrder] - 
           priorityOrder[b.priority as keyof typeof priorityOrder];
  });
};