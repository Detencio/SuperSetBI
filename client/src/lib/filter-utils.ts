import { useState, useEffect, useMemo } from 'react';

// Tipos de filtros disponibles
export type FilterType = 'text' | 'select' | 'multiselect' | 'number' | 'date' | 'daterange' | 'boolean';

export interface FilterOption {
  label: string;
  value: string | number | boolean;
  count?: number; // Para mostrar cantidad de elementos
}

export interface FilterConfig {
  id: string;
  label: string;
  type: FilterType;
  field: string; // Campo del objeto a filtrar
  placeholder?: string;
  options?: FilterOption[]; // Para select/multiselect
  min?: number; // Para number
  max?: number; // Para number
  step?: number; // Para number
  defaultValue?: any;
  required?: boolean;
  description?: string;
}

export interface FilterValue {
  id: string;
  value: any;
  operator?: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'gte' | 'lt' | 'lte' | 'between' | 'in';
}

export interface FilterGroup {
  id: string;
  name: string;
  description?: string;
  filters: FilterConfig[];
  operator?: 'AND' | 'OR'; // Cómo combinar filtros del grupo
}

export interface SegmentConfig {
  id: string;
  name: string;
  description: string;
  color: string;
  icon?: string;
  filters: FilterValue[];
  count?: number;
}

// Operadores de comparación
export const OPERATORS = {
  equals: { label: 'Igual a', symbol: '=' },
  contains: { label: 'Contiene', symbol: '∋' },
  startsWith: { label: 'Empieza con', symbol: '⌐' },
  endsWith: { label: 'Termina con', symbol: '⌐⌐' },
  gt: { label: 'Mayor que', symbol: '>' },
  gte: { label: 'Mayor o igual', symbol: '≥' },
  lt: { label: 'Menor que', symbol: '<' },
  lte: { label: 'Menor o igual', symbol: '≤' },
  between: { label: 'Entre', symbol: '↔' },
  in: { label: 'En lista', symbol: '∈' }
};

// Función para evaluar un filtro individual
export const evaluateFilter = (item: any, filter: FilterValue): boolean => {
  const fieldValue = getNestedValue(item, filter.id);
  const filterValue = filter.value;
  const operator = filter.operator || 'equals';

  if (fieldValue === null || fieldValue === undefined) return false;
  if (filterValue === null || filterValue === undefined || filterValue === '') return true;

  switch (operator) {
    case 'equals':
      return fieldValue === filterValue;
    
    case 'contains':
      return String(fieldValue).toLowerCase().includes(String(filterValue).toLowerCase());
    
    case 'startsWith':
      return String(fieldValue).toLowerCase().startsWith(String(filterValue).toLowerCase());
    
    case 'endsWith':
      return String(fieldValue).toLowerCase().endsWith(String(filterValue).toLowerCase());
    
    case 'gt':
      return Number(fieldValue) > Number(filterValue);
    
    case 'gte':
      return Number(fieldValue) >= Number(filterValue);
    
    case 'lt':
      return Number(fieldValue) < Number(filterValue);
    
    case 'lte':
      return Number(fieldValue) <= Number(filterValue);
    
    case 'between':
      if (Array.isArray(filterValue) && filterValue.length === 2) {
        const numValue = Number(fieldValue);
        return numValue >= Number(filterValue[0]) && numValue <= Number(filterValue[1]);
      }
      return false;
    
    case 'in':
      if (Array.isArray(filterValue)) {
        return filterValue.includes(fieldValue);
      }
      return fieldValue === filterValue;
    
    default:
      return true;
  }
};

// Función para obtener valor anidado (ej: "product.category")
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

// Función para aplicar múltiples filtros
export const applyFilters = (
  data: any[], 
  filters: FilterValue[], 
  operator: 'AND' | 'OR' = 'AND'
): any[] => {
  if (!filters.length) return data;

  return data.filter(item => {
    const results = filters.map(filter => evaluateFilter(item, filter));
    
    return operator === 'AND' 
      ? results.every(result => result)
      : results.some(result => result);
  });
};

// Función para generar opciones automáticamente desde los datos
export const generateFilterOptions = (
  data: any[], 
  field: string,
  maxOptions: number = 100
): FilterOption[] => {
  const values = data
    .map(item => getNestedValue(item, field))
    .filter(value => value !== null && value !== undefined);

  const counts = values.reduce((acc, value) => {
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a) // Ordenar por frecuencia
    .slice(0, maxOptions)
    .map(([value, count]) => ({
      label: String(value),
      value: value,
      count: count
    }));
};

// Segmentos predefinidos comunes
export const COMMON_SEGMENTS = {
  inventory: [
    {
      id: 'low-stock',
      name: 'Stock Bajo',
      description: 'Productos con stock por debajo del mínimo',
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: 'AlertTriangle',
      filters: [
        { id: 'stock', value: 10, operator: 'lte' as const }
      ]
    },
    {
      id: 'high-value',
      name: 'Alto Valor',
      description: 'Productos con precio superior a $50.000',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: 'DollarSign',
      filters: [
        { id: 'price', value: 50000, operator: 'gte' as const }
      ]
    },
    {
      id: 'premium-category',
      name: 'Categoría Premium',
      description: 'Productos de categoría Premium',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: 'Crown',
      filters: [
        { id: 'category', value: 'Premium', operator: 'equals' as const }
      ]
    }
  ],
  sales: [
    {
      id: 'high-volume',
      name: 'Alto Volumen',
      description: 'Ventas mayores a $100.000',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: 'TrendingUp',
      filters: [
        { id: 'total', value: 100000, operator: 'gte' as const }
      ]
    },
    {
      id: 'recent-sales',
      name: 'Ventas Recientes',
      description: 'Ventas de los últimos 7 días',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: 'Clock',
      filters: [
        { id: 'date', value: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], operator: 'gte' as const }
      ]
    }
  ],
  collections: [
    {
      id: 'overdue',
      name: 'Vencidas',
      description: 'Cobranzas vencidas',
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: 'AlertCircle',
      filters: [
        { id: 'status', value: 'overdue', operator: 'equals' as const }
      ]
    },
    {
      id: 'high-amount',
      name: 'Monto Alto',
      description: 'Cobranzas superiores a $200.000',
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      icon: 'DollarSign',
      filters: [
        { id: 'amount', value: 200000, operator: 'gte' as const }
      ]
    }
  ]
};

// Hook personalizado para filtros avanzados
export const useAdvancedFilters = (data: any[], initialFilters: FilterValue[] = []) => {
  const [filters, setFilters] = useState<FilterValue[]>(initialFilters);
  const [operator, setOperator] = useState<'AND' | 'OR'>('AND');
  const [activeSegments, setActiveSegments] = useState<string[]>([]);

  // Datos filtrados
  const filteredData = useMemo(() => {
    return applyFilters(data, filters, operator);
  }, [data, filters, operator]);

  // Estadísticas de filtros
  const filterStats = useMemo(() => {
    return {
      total: data.length,
      filtered: filteredData.length,
      percentage: data.length > 0 ? Math.round((filteredData.length / data.length) * 100) : 0
    };
  }, [data, filteredData]);

  // Funciones para manejar filtros
  const addFilter = (filter: FilterValue) => {
    setFilters(prev => {
      const existing = prev.findIndex(f => f.id === filter.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = filter;
        return updated;
      }
      return [...prev, filter];
    });
  };

  const removeFilter = (filterId: string) => {
    setFilters(prev => prev.filter(f => f.id !== filterId));
  };

  const clearFilters = () => {
    setFilters([]);
    setActiveSegments([]);
  };

  const applySegment = (segment: SegmentConfig) => {
    setFilters(prev => {
      // Remover filtros existentes del segmento
      const withoutSegmentFilters = prev.filter(f => 
        !segment.filters.some(sf => sf.id === f.id)
      );
      
      // Agregar nuevos filtros del segmento
      return [...withoutSegmentFilters, ...segment.filters];
    });
    
    setActiveSegments(prev => 
      prev.includes(segment.id) 
        ? prev.filter(id => id !== segment.id)
        : [...prev, segment.id]
    );
  };

  return {
    filters,
    filteredData,
    filterStats,
    operator,
    activeSegments,
    setOperator,
    addFilter,
    removeFilter,
    clearFilters,
    applySegment,
    setFilters
  };
};

// Hook para generar configuraciones de filtro automáticamente
export const useAutoFilterConfig = (data: any[], module: string): FilterConfig[] => {
  return useMemo(() => {
    if (!data.length) return [];

    const configs: FilterConfig[] = [];
    const sample = data[0];

    // Generar filtros basados en la estructura de datos
    Object.keys(sample).forEach(key => {
      const values = data.map(item => item[key]).filter(v => v !== null && v !== undefined);
      const uniqueValues = [...new Set(values)];
      
      if (uniqueValues.length === 0) return;

      // Determinar tipo de filtro
      const firstValue = uniqueValues[0];
      
      if (typeof firstValue === 'boolean') {
        configs.push({
          id: key,
          label: formatFieldName(key),
          type: 'boolean',
          field: key
        });
      } else if (typeof firstValue === 'number') {
        const min = Math.min(...values);
        const max = Math.max(...values);
        
        configs.push({
          id: key,
          label: formatFieldName(key),
          type: 'number',
          field: key,
          min,
          max,
          step: key.includes('price') || key.includes('amount') ? 1000 : 1
        });
      } else if (typeof firstValue === 'string') {
        // Si hay pocas opciones únicas, usar select
        if (uniqueValues.length <= 20) {
          configs.push({
            id: key,
            label: formatFieldName(key),
            type: 'select',
            field: key,
            options: generateFilterOptions(data, key)
          });
        } else {
          // Si hay muchas opciones, usar texto
          configs.push({
            id: key,
            label: formatFieldName(key),
            type: 'text',
            field: key,
            placeholder: `Buscar por ${formatFieldName(key).toLowerCase()}...`
          });
        }
      }
    });

    return configs;
  }, [data, module]);
};

// Función auxiliar para formatear nombres de campos
const formatFieldName = (fieldName: string): string => {
  const mappings: Record<string, string> = {
    'name': 'Nombre',
    'category': 'Categoría',
    'price': 'Precio',
    'stock': 'Stock',
    'sku': 'SKU',
    'status': 'Estado',
    'date': 'Fecha',
    'amount': 'Monto',
    'total': 'Total',
    'customer': 'Cliente',
    'product': 'Producto'
  };

  return mappings[fieldName] || fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
};