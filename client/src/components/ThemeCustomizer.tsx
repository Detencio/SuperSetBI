import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { 
  Palette, 
  Check, 
  Sparkles,
  Sun,
  Moon,
  Droplets,
  TreePine,
  Sunset,
  Crown
} from "lucide-react";
import { useTheme, THEMES } from "@/lib/theme-utils";

interface ThemeCustomizerProps {
  variant?: "button" | "panel";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const getThemeIcon = (themeId: string) => {
  switch (themeId) {
    case 'superset': return Sparkles;
    case 'ocean': return Droplets;
    case 'forest': return TreePine;
    case 'sunset': return Sunset;
    case 'purple': return Crown;
    case 'dark': return Moon;
    default: return Sun;
  }
};

export default function ThemeCustomizer({ 
  variant = "button", 
  size = "md",
  showLabel = true 
}: ThemeCustomizerProps) {
  const { currentTheme, setTheme, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  if (variant === "panel") {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Personalizar Tema
          </CardTitle>
          <p className="text-sm text-text-secondary">
            Selecciona un tema para personalizar la apariencia del dashboard
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableThemes.map((theme) => {
              const Icon = getThemeIcon(theme.id);
              const isSelected = currentTheme.id === theme.id;
              
              return (
                <Card 
                  key={theme.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${
                    isSelected 
                      ? 'border-primary shadow-md ring-2 ring-primary/20' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setTheme(theme.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="font-medium text-sm">{theme.name}</span>
                      </div>
                      {isSelected && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    
                    {/* Vista previa de colores */}
                    <div className="flex gap-1 mb-2">
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: theme.preview || theme.colors.primary }}
                      />
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: theme.colors.secondary }}
                      />
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: theme.colors.accent }}
                      />
                    </div>
                    
                    <p className="text-xs text-text-secondary">
                      {theme.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {/* Información del tema actual */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="font-normal">
                Tema Actual
              </Badge>
              <span className="font-medium">{currentTheme.name}</span>
            </div>
            <p className="text-sm text-text-secondary">
              {currentTheme.description}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size={size}
          className={`gap-2 ${size === 'sm' ? 'h-8 px-2' : ''}`}
          data-testid="button-theme-customizer"
        >
          <Palette className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'}`} />
          {showLabel && (
            <span className={`${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
              Tema
            </span>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <h4 className="font-medium flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Personalizar Tema
          </h4>
          <p className="text-sm text-text-secondary mt-1">
            Cambia la apariencia con un solo clic
          </p>
        </div>
        
        <div className="p-4 space-y-3">
          {availableThemes.map((theme) => {
            const Icon = getThemeIcon(theme.id);
            const isSelected = currentTheme.id === theme.id;
            
            return (
              <div
                key={theme.id}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'bg-primary/10 border border-primary/20' 
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
                onClick={() => {
                  setTheme(theme.id);
                  setIsOpen(false);
                }}
                data-testid={`theme-option-${theme.id}`}
              >
                {/* Icono del tema */}
                <div className="flex-shrink-0">
                  <Icon className="h-4 w-4" />
                </div>
                
                {/* Vista previa de colores */}
                <div className="flex gap-1 flex-shrink-0">
                  <div 
                    className="w-4 h-4 rounded-full border border-gray-200"
                    style={{ backgroundColor: theme.preview || theme.colors.primary }}
                  />
                  <div 
                    className="w-4 h-4 rounded-full border border-gray-200"
                    style={{ backgroundColor: theme.colors.secondary }}
                  />
                  <div 
                    className="w-4 h-4 rounded-full border border-gray-200"
                    style={{ backgroundColor: theme.colors.accent }}
                  />
                </div>
                
                {/* Información del tema */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{theme.name}</span>
                    {isSelected && (
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-text-secondary truncate">
                    {theme.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <Sparkles className="h-3 w-3" />
            <span>Los cambios se aplican instantáneamente</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}