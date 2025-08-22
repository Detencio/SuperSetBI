import { FilterConfig } from "@/lib/filter-utils";

// Configuraciones de filtros para el módulo de inventario
export const INVENTORY_FILTER_CONFIGS: FilterConfig[] = [
  {
    id: 'name',
    label: 'Nombre del Producto',
    type: 'text',
    field: 'name',
    placeholder: 'Buscar por nombre...',
    description: 'Filtrar productos por nombre'
  },
  {
    id: 'category',
    label: 'Categoría',
    type: 'select',
    field: 'category',
    description: 'Filtrar por categoría de producto'
  },
  {
    id: 'sku',
    label: 'SKU',
    type: 'text',
    field: 'sku',
    placeholder: 'Buscar por SKU...',
    description: 'Filtrar por código SKU'
  },
  {
    id: 'price',
    label: 'Precio',
    type: 'number',
    field: 'price',
    min: 0,
    max: 1000000,
    step: 1000,
    description: 'Filtrar por rango de precio'
  },
  {
    id: 'stock',
    label: 'Stock',
    type: 'number',
    field: 'stock',
    min: 0,
    max: 1000,
    step: 1,
    description: 'Filtrar por cantidad en stock'
  }
];

// Configuraciones de filtros para el módulo de ventas
export const SALES_FILTER_CONFIGS: FilterConfig[] = [
  {
    id: 'customer',
    label: 'Cliente',
    type: 'text',
    field: 'customer',
    placeholder: 'Buscar por cliente...',
    description: 'Filtrar ventas por cliente'
  },
  {
    id: 'product',
    label: 'Producto',
    type: 'text',
    field: 'productName',
    placeholder: 'Buscar por producto...',
    description: 'Filtrar por producto vendido'
  },
  {
    id: 'total',
    label: 'Total de Venta',
    type: 'number',
    field: 'total',
    min: 0,
    max: 10000000,
    step: 10000,
    description: 'Filtrar por monto total de venta'
  },
  {
    id: 'quantity',
    label: 'Cantidad',
    type: 'number',
    field: 'quantity',
    min: 1,
    max: 1000,
    step: 1,
    description: 'Filtrar por cantidad vendida'
  },
  {
    id: 'date',
    label: 'Fecha',
    type: 'date',
    field: 'date',
    description: 'Filtrar por fecha de venta'
  },
  {
    id: 'status',
    label: 'Estado',
    type: 'select',
    field: 'status',
    options: [
      { label: 'Completada', value: 'completed' },
      { label: 'Pendiente', value: 'pending' },
      { label: 'Cancelada', value: 'cancelled' }
    ],
    description: 'Filtrar por estado de la venta'
  }
];

// Configuraciones de filtros para el módulo de cobranzas
export const COLLECTIONS_FILTER_CONFIGS: FilterConfig[] = [
  {
    id: 'customer',
    label: 'Cliente',
    type: 'text',
    field: 'customer',
    placeholder: 'Buscar por cliente...',
    description: 'Filtrar cobranzas por cliente'
  },
  {
    id: 'amount',
    label: 'Monto',
    type: 'number',
    field: 'amount',
    min: 0,
    max: 10000000,
    step: 10000,
    description: 'Filtrar por monto de cobranza'
  },
  {
    id: 'status',
    label: 'Estado',
    type: 'select',
    field: 'status',
    options: [
      { label: 'Pendiente', value: 'pending' },
      { label: 'Pagado', value: 'paid' },
      { label: 'Vencido', value: 'overdue' },
      { label: 'En Proceso', value: 'processing' }
    ],
    description: 'Filtrar por estado de cobranza'
  },
  {
    id: 'dueDate',
    label: 'Fecha de Vencimiento',
    type: 'date',
    field: 'dueDate',
    description: 'Filtrar por fecha de vencimiento'
  },
  {
    id: 'paymentMethod',
    label: 'Método de Pago',
    type: 'select',
    field: 'paymentMethod',
    options: [
      { label: 'Transferencia', value: 'transfer' },
      { label: 'Efectivo', value: 'cash' },
      { label: 'Cheque', value: 'check' },
      { label: 'Tarjeta', value: 'card' }
    ],
    description: 'Filtrar por método de pago'
  },
  {
    id: 'priority',
    label: 'Prioridad',
    type: 'select',
    field: 'priority',
    options: [
      { label: 'Alta', value: 'high' },
      { label: 'Media', value: 'medium' },
      { label: 'Baja', value: 'low' }
    ],
    description: 'Filtrar por prioridad de cobranza'
  }
];

// Función para obtener configuraciones por módulo
export const getFilterConfigsByModule = (module: string): FilterConfig[] => {
  switch (module) {
    case 'inventory':
      return INVENTORY_FILTER_CONFIGS;
    case 'sales':
      return SALES_FILTER_CONFIGS;
    case 'collections':
      return COLLECTIONS_FILTER_CONFIGS;
    default:
      return [];
  }
};

// Función para generar opciones dinámicamente desde los datos
export const generateDynamicFilterConfigs = (data: any[], baseConfigs: FilterConfig[]): FilterConfig[] => {
  if (!data || data.length === 0) return baseConfigs;

  return baseConfigs.map(config => {
    // Si es un filtro de tipo select sin opciones predefinidas, generar opciones desde los datos
    if (config.type === 'select' && !config.options) {
      const values = data
        .map(item => item[config.field])
        .filter(value => value !== null && value !== undefined && value !== '');
      
      const uniqueValues = [...new Set(values)];
      const options = uniqueValues
        .sort()
        .map(value => ({
          label: String(value),
          value: value,
          count: data.filter(item => item[config.field] === value).length
        }));

      return {
        ...config,
        options: options.slice(0, 20) // Limitar a 20 opciones máximo
      };
    }

    // Para filtros numéricos, calcular min/max desde los datos si no están definidos
    if (config.type === 'number' && (config.min === undefined || config.max === undefined)) {
      const numericValues = data
        .map(item => Number(item[config.field]))
        .filter(value => !isNaN(value));

      if (numericValues.length > 0) {
        const min = Math.min(...numericValues);
        const max = Math.max(...numericValues);
        
        return {
          ...config,
          min: config.min ?? Math.floor(min),
          max: config.max ?? Math.ceil(max)
        };
      }
    }

    return config;
  });
};