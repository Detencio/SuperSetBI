import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { 
  Filter, 
  X, 
  Plus, 
  Settings,
  Search,
  ChevronDown,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Clock,
  Crown,
  AlertCircle,
  BarChart3
} from "lucide-react";
import { 
  FilterConfig, 
  FilterValue, 
  SegmentConfig,
  OPERATORS,
  COMMON_SEGMENTS,
  useAdvancedFilters 
} from "@/lib/filter-utils";
import React from "react";

interface AdvancedFiltersProps {
  data: any[];
  onFilteredDataChange: (filteredData: any[]) => void;
  filterConfigs?: FilterConfig[];
  module?: 'inventory' | 'sales' | 'collections';
  variant?: 'compact' | 'full';
  showSegments?: boolean;
}

const getIconComponent = (iconName: string) => {
  const icons: Record<string, any> = {
    AlertTriangle,
    DollarSign,
    Crown,
    TrendingUp,
    Clock,
    AlertCircle,
    BarChart3
  };
  return icons[iconName] || Filter;
};

export default function AdvancedFilters({
  data,
  onFilteredDataChange,
  filterConfigs = [],
  module = 'inventory',
  variant = 'compact',
  showSegments = true
}: AdvancedFiltersProps) {
  const {
    filters,
    filteredData,
    filterStats,
    operator,
    activeSegments,
    setOperator,
    addFilter,
    removeFilter,
    clearFilters,
    applySegment
  } = useAdvancedFilters(data);

  const [isExpanded, setIsExpanded] = useState(false);
  const [newFilterField, setNewFilterField] = useState('');
  
  // Notificar cambios en datos filtrados
  React.useEffect(() => {
    onFilteredDataChange(filteredData);
  }, [filteredData, onFilteredDataChange]);

  // Segmentos disponibles para el módulo actual
  const availableSegments = COMMON_SEGMENTS[module] || [];

  const handleAddFilter = (config: FilterConfig, value: any, op: string = 'equals') => {
    addFilter({
      id: config.field,
      value,
      operator: op as any
    });
  };

  const renderFilterInput = (config: FilterConfig, existingFilter?: FilterValue) => {
    const currentValue = existingFilter?.value || config.defaultValue;
    
    switch (config.type) {
      case 'text':
        return (
          <Input
            placeholder={config.placeholder}
            value={currentValue || ''}
            onChange={(e) => handleAddFilter(config, e.target.value, 'contains')}
            className="w-full"
          />
        );
      
      case 'select':
        return (
          <Select
            value={currentValue || ''}
            onValueChange={(value) => handleAddFilter(config, value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={`Seleccionar ${config.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {config.options?.map((option) => (
                <SelectItem key={String(option.value)} value={String(option.value)}>
                  <div className="flex items-center justify-between w-full">
                    <span>{option.label}</span>
                    {option.count && (
                      <Badge variant="secondary" className="ml-2">
                        {option.count}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'number':
        return (
          <div className="space-y-2">
            <Input
              type="number"
              placeholder={`${config.label} mínimo`}
              min={config.min}
              max={config.max}
              step={config.step}
              value={currentValue || ''}
              onChange={(e) => handleAddFilter(config, Number(e.target.value), 'gte')}
              className="w-full"
            />
            {config.min !== undefined && config.max !== undefined && (
              <div className="px-2">
                <Slider
                  value={[currentValue || config.min]}
                  min={config.min}
                  max={config.max}
                  step={config.step || 1}
                  onValueChange={([value]) => handleAddFilter(config, value, 'gte')}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{config.min}</span>
                  <span>{config.max}</span>
                </div>
              </div>
            )}
          </div>
        );
      
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={currentValue || false}
              onCheckedChange={(checked) => handleAddFilter(config, checked)}
            />
            <Label className="text-sm">{config.label}</Label>
          </div>
        );
      
      case 'date':
        return (
          <Input
            type="date"
            value={currentValue || ''}
            onChange={(e) => handleAddFilter(config, e.target.value, 'gte')}
            className="w-full"
          />
        );
      
      default:
        return null;
    }
  };

  if (variant === 'compact') {
    return (
      <div className="space-y-4">
        {/* Barra de filtros compacta */}
        <div className="flex items-center gap-2 flex-wrap">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filtros
                {filters.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {filters.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <div className="p-4 border-b">
                <h4 className="font-medium">Filtros Avanzados</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {filterStats.filtered} de {filterStats.total} elementos ({filterStats.percentage}%)
                </p>
              </div>
              
              <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                {filterConfigs.map((config) => {
                  const existingFilter = filters.find(f => f.id === config.field);
                  return (
                    <div key={config.id} className="space-y-2">
                      <Label className="text-sm font-medium">{config.label}</Label>
                      {renderFilterInput(config, existingFilter)}
                    </div>
                  );
                })}
              </div>
              
              {filters.length > 0 && (
                <div className="p-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    Limpiar Filtros
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          {/* Segmentos rápidos */}
          {showSegments && availableSegments.map((segment) => {
            const Icon = getIconComponent(segment.icon || 'Filter');
            const isActive = activeSegments.includes(segment.id);
            
            return (
              <Button
                key={segment.id}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => applySegment(segment)}
                className={`gap-2 ${isActive ? '' : 'hover:bg-gray-50'}`}
                data-testid={`segment-${segment.id}`}
              >
                <Icon className="h-3 w-3" />
                {segment.name}
              </Button>
            );
          })}

          {/* Filtros activos */}
          {filters.map((filter) => {
            const config = filterConfigs.find(c => c.field === filter.id);
            return (
              <Badge
                key={filter.id}
                variant="secondary"
                className="gap-1 pr-1"
              >
                <span className="text-xs">
                  {config?.label || filter.id}: {String(filter.value)}
                </span>
                <button
                  onClick={() => removeFilter(filter.id)}
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>

        {/* Estadísticas */}
        {filters.length > 0 && (
          <div className="text-sm text-gray-600">
            Mostrando {filterStats.filtered} de {filterStats.total} elementos
            {filterStats.percentage < 100 && (
              <span className="ml-2">
                ({filterStats.percentage}% del total)
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  // Versión completa del componente
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros Avanzados
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {filterStats.filtered} / {filterStats.total}
            </Badge>
            {filters.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Limpiar
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Segmentos predefinidos */}
        {showSegments && availableSegments.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Segmentos Rápidos</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {availableSegments.map((segment) => {
                const Icon = getIconComponent(segment.icon || 'Filter');
                const isActive = activeSegments.includes(segment.id);
                
                return (
                  <Card
                    key={segment.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      isActive 
                        ? 'border-primary shadow-md ring-2 ring-primary/20' 
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => applySegment(segment)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="h-4 w-4" />
                        <span className="font-medium text-sm">{segment.name}</span>
                      </div>
                      <p className="text-xs text-gray-600">
                        {segment.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Filtros personalizados */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Filtros Personalizados</Label>
            <Select value={operator} onValueChange={(value: 'AND' | 'OR') => setOperator(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AND">Y (AND)</SelectItem>
                <SelectItem value="OR">O (OR)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterConfigs.map((config) => {
              const existingFilter = filters.find(f => f.id === config.field);
              
              return (
                <div key={config.id} className="space-y-2">
                  <Label className="text-sm font-medium">{config.label}</Label>
                  {renderFilterInput(config, existingFilter)}
                  {config.description && (
                    <p className="text-xs text-gray-500">{config.description}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Filtros activos */}
        {filters.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Filtros Activos</Label>
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => {
                const config = filterConfigs.find(c => c.field === filter.id);
                const operatorInfo = OPERATORS[filter.operator || 'equals'];
                
                return (
                  <Badge
                    key={filter.id}
                    variant="secondary"
                    className="gap-2 pr-2"
                  >
                    <span className="text-xs">
                      {config?.label || filter.id} {operatorInfo.symbol} {String(filter.value)}
                    </span>
                    <button
                      onClick={() => removeFilter(filter.id)}
                      className="hover:bg-gray-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Estadísticas de filtrado */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {filterStats.total}
              </div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {filterStats.filtered}
              </div>
              <div className="text-xs text-gray-600">Filtrados</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {filterStats.percentage}%
              </div>
              <div className="text-xs text-gray-600">Porcentaje</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}