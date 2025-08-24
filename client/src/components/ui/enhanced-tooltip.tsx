import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  DollarSign,
  Package,
  BarChart3
} from "lucide-react";

export interface EnhancedTooltipData {
  // Datos principales
  value: number | string;
  label: string;
  
  // Información adicional
  additionalInfo?: {
    change?: number;
    changeType?: 'positive' | 'negative' | 'neutral';
    percentage?: number;
    target?: number;
    status?: 'excellent' | 'good' | 'warning' | 'critical';
    description?: string;
    trend?: 'up' | 'down' | 'stable';
  };
  
  // Estilo y presentación
  color?: string;
  icon?: 'currency' | 'package' | 'chart' | 'info';
  format?: 'currency' | 'percentage' | 'number' | 'text';
}

interface EnhancedTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  data?: EnhancedTooltipData;
  style?: 'modern' | 'compact' | 'detailed';
}

const formatValue = (value: number | string, format?: string) => {
  if (typeof value === 'string') return value;
  
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    case 'percentage':
      return `${value}%`;
    case 'number':
      return new Intl.NumberFormat('es-MX').format(value);
    default:
      return value.toString();
  }
};

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
    case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'critical': return 'text-red-600 bg-red-50 border-red-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

const getStatusIcon = (status?: string) => {
  switch (status) {
    case 'excellent': return <CheckCircle className="h-3 w-3" />;
    case 'good': return <CheckCircle className="h-3 w-3" />;
    case 'warning': return <AlertTriangle className="h-3 w-3" />;
    case 'critical': return <AlertTriangle className="h-3 w-3" />;
    default: return <Info className="h-3 w-3" />;
  }
};

const getMainIcon = (icon?: string) => {
  switch (icon) {
    case 'currency': return <DollarSign className="h-4 w-4" />;
    case 'package': return <Package className="h-4 w-4" />;
    case 'chart': return <BarChart3 className="h-4 w-4" />;
    default: return <Info className="h-4 w-4" />;
  }
};

const getTrendIcon = (trend?: string) => {
  switch (trend) {
    case 'up': return <TrendingUp className="h-3 w-3 text-green-500" />;
    case 'down': return <TrendingDown className="h-3 w-3 text-red-500" />;
    default: return null;
  }
};

export function EnhancedTooltip({ 
  active, 
  payload, 
  label, 
  data, 
  style = 'modern' 
}: EnhancedTooltipProps) {
  // Si no hay datos activos, no mostrar tooltip
  if (!active) return null;

  // Usar datos del payload de recharts o datos personalizados
  const tooltipData: EnhancedTooltipData = data || (payload && payload[0] ? {
    value: payload[0].value,
    label: payload[0].name || label || '',
    color: payload[0].color,
    format: 'number',
    icon: 'chart'
  } : {
    value: '',
    label: '',
    format: 'text',
    icon: 'info'
  });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 10 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 20,
          duration: 0.2 
        }}
        className="z-50"
      >
        <Card className={`
          bg-white/95 backdrop-blur-md border shadow-xl
          ${style === 'compact' ? 'p-3' : 'p-4'}
          max-w-xs min-w-48
        `}>
          {/* Header con icono y valor principal */}
          <div className="flex items-center gap-3 mb-3">
            <motion.div 
              className={`
                w-10 h-10 rounded-lg flex items-center justify-center
                ${tooltipData.color ? '' : 'bg-blue-100'}
              `}
              style={{ 
                backgroundColor: tooltipData.color ? `${tooltipData.color}20` : undefined,
                color: tooltipData.color || '#3b82f6'
              }}
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              {getMainIcon(tooltipData.icon)}
            </motion.div>
            
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-600 mb-1">
                {tooltipData.label}
              </p>
              <motion.p 
                className="text-lg font-bold text-gray-900"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                {formatValue(tooltipData.value, tooltipData.format)}
              </motion.p>
            </div>

            {/* Indicador de tendencia */}
            {tooltipData.additionalInfo?.trend && (
              <motion.div
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {getTrendIcon(tooltipData.additionalInfo.trend)}
              </motion.div>
            )}
          </div>

          {/* Información adicional */}
          {tooltipData.additionalInfo && (
            <div className="space-y-3">
              {/* Cambio y porcentaje */}
              {(tooltipData.additionalInfo.change !== undefined || tooltipData.additionalInfo.percentage !== undefined) && (
                <div className="flex items-center justify-between text-sm">
                  {tooltipData.additionalInfo.change !== undefined && (
                    <motion.div 
                      className={`flex items-center gap-1 ${
                        tooltipData.additionalInfo.changeType === 'positive' ? 'text-green-600' :
                        tooltipData.additionalInfo.changeType === 'negative' ? 'text-red-600' :
                        'text-gray-600'
                      }`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 }}
                    >
                      <span className="text-xs">Cambio:</span>
                      <span className="font-medium">
                        {tooltipData.additionalInfo.change > 0 ? '+' : ''}
                        {formatValue(tooltipData.additionalInfo.change, tooltipData.format)}
                      </span>
                    </motion.div>
                  )}
                  
                  {tooltipData.additionalInfo.percentage !== undefined && (
                    <motion.div 
                      className="text-xs text-gray-500"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {tooltipData.additionalInfo.percentage}%
                    </motion.div>
                  )}
                </div>
              )}

              {/* Barra de progreso para targets */}
              {tooltipData.additionalInfo.target && (
                <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ delay: 0.25 }}
                  className="space-y-1"
                >
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Progreso vs objetivo</span>
                    <span>{Math.round((Number(tooltipData.value) / tooltipData.additionalInfo.target) * 100)}%</span>
                  </div>
                  <Progress 
                    value={(Number(tooltipData.value) / tooltipData.additionalInfo.target) * 100} 
                    className="h-2"
                  />
                </motion.div>
              )}

              {/* Badge de status */}
              {tooltipData.additionalInfo.status && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getStatusColor(tooltipData.additionalInfo.status)}`}
                  >
                    <div className="flex items-center gap-1">
                      {getStatusIcon(tooltipData.additionalInfo.status)}
                      <span className="capitalize">{tooltipData.additionalInfo.status}</span>
                    </div>
                  </Badge>
                </motion.div>
              )}

              {/* Descripción adicional */}
              {tooltipData.additionalInfo.description && (
                <motion.p 
                  className="text-xs text-gray-600 leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                >
                  {tooltipData.additionalInfo.description}
                </motion.p>
              )}
            </div>
          )}

          {/* Efecto de brillo sutil */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: "100%", opacity: 1 }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              repeatDelay: 3,
              ease: "linear" 
            }}
            style={{ width: "50%", pointerEvents: "none" }}
          />
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

// Componente específico para tooltips de recharts
export function RechartsEnhancedTooltip({ 
  active, 
  payload, 
  label,
  contentStyle = {},
  labelStyle = {},
  ...props 
}: any) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0];
  
  // Crear datos enriquecidos basados en el contexto
  const enrichedData: EnhancedTooltipData = {
    value: data.value,
    label: data.name || label,
    color: data.color,
    format: data.name?.includes('$') || data.name?.includes('Precio') || data.name?.includes('Valor') ? 'currency' : 
            data.name?.includes('%') || data.name?.includes('Porcentaje') ? 'percentage' : 'number',
    icon: data.name?.includes('$') || data.name?.includes('Precio') || data.name?.includes('Valor') ? 'currency' :
          data.name?.includes('Stock') || data.name?.includes('Producto') ? 'package' : 'chart',
    additionalInfo: {
      // Simular datos adicionales basados en el valor
      change: data.value > 1000 ? Math.round((data.value * 0.1) - (Math.random() * data.value * 0.2)) : undefined,
      changeType: data.value > 1000 && Math.random() > 0.5 ? 'positive' : 'negative',
      status: data.value > 5000 ? 'excellent' : 
              data.value > 2000 ? 'good' : 
              data.value > 500 ? 'warning' : 'critical',
      trend: Math.random() > 0.5 ? 'up' : 'down',
      description: data.name?.includes('Stock') ? 'Nivel de inventario actual' :
                   data.name?.includes('Ventas') ? 'Ingresos del período' :
                   data.name?.includes('Rotación') ? 'Velocidad de movimiento' : undefined
    }
  };

  return <EnhancedTooltip active={active} data={enrichedData} style="modern" />;
}

export default EnhancedTooltip;