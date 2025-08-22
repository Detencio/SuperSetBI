import { useState, useEffect } from 'react';

// Definición de temas disponibles
export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  gradients: {
    primary: string;
    secondary: string;
    accent: string;
  };
  preview?: string; // Color para mostrar en el selector
}

export const THEMES: Record<string, ThemeConfig> = {
  superset: {
    id: 'superset',
    name: 'Superset Original',
    description: 'Tema original inspirado en Apache Superset',
    preview: '#1f77b4',
    colors: {
      primary: 'hsl(210, 100%, 50%)',
      secondary: 'hsl(210, 10%, 50%)',
      accent: 'hsl(25, 100%, 50%)',
      background: 'hsl(0, 0%, 100%)',
      surface: 'hsl(210, 20%, 98%)',
      text: 'hsl(210, 11%, 15%)',
      textSecondary: 'hsl(210, 9%, 45%)',
      border: 'hsl(210, 18%, 87%)',
      success: 'hsl(142, 76%, 36%)',
      warning: 'hsl(38, 92%, 50%)',
      error: 'hsl(0, 84%, 60%)',
      info: 'hsl(210, 100%, 50%)'
    },
    gradients: {
      primary: 'linear-gradient(135deg, hsl(210, 100%, 50%) 0%, hsl(220, 100%, 60%) 100%)',
      secondary: 'linear-gradient(135deg, hsl(210, 10%, 50%) 0%, hsl(220, 10%, 60%) 100%)',
      accent: 'linear-gradient(135deg, hsl(25, 100%, 50%) 0%, hsl(35, 100%, 60%) 100%)'
    }
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean Blue',
    description: 'Tema azul océano profesional',
    preview: '#0066cc',
    colors: {
      primary: 'hsl(210, 100%, 40%)',
      secondary: 'hsl(200, 80%, 50%)',
      accent: 'hsl(190, 100%, 45%)',
      background: 'hsl(220, 25%, 97%)',
      surface: 'hsl(220, 20%, 95%)',
      text: 'hsl(220, 20%, 15%)',
      textSecondary: 'hsl(220, 15%, 45%)',
      border: 'hsl(220, 15%, 85%)',
      success: 'hsl(160, 70%, 40%)',
      warning: 'hsl(35, 90%, 55%)',
      error: 'hsl(0, 75%, 55%)',
      info: 'hsl(210, 100%, 40%)'
    },
    gradients: {
      primary: 'linear-gradient(135deg, hsl(210, 100%, 40%) 0%, hsl(200, 100%, 50%) 100%)',
      secondary: 'linear-gradient(135deg, hsl(200, 80%, 50%) 0%, hsl(190, 80%, 60%) 100%)',
      accent: 'linear-gradient(135deg, hsl(190, 100%, 45%) 0%, hsl(180, 100%, 55%) 100%)'
    }
  },
  forest: {
    id: 'forest',
    name: 'Forest Green',
    description: 'Tema verde bosque natural',
    preview: '#22c55e',
    colors: {
      primary: 'hsl(142, 76%, 36%)',
      secondary: 'hsl(160, 60%, 45%)',
      accent: 'hsl(120, 70%, 50%)',
      background: 'hsl(120, 15%, 97%)',
      surface: 'hsl(120, 10%, 95%)',
      text: 'hsl(120, 20%, 15%)',
      textSecondary: 'hsl(120, 15%, 45%)',
      border: 'hsl(120, 15%, 85%)',
      success: 'hsl(142, 76%, 36%)',
      warning: 'hsl(45, 90%, 55%)',
      error: 'hsl(0, 75%, 55%)',
      info: 'hsl(200, 100%, 45%)'
    },
    gradients: {
      primary: 'linear-gradient(135deg, hsl(142, 76%, 36%) 0%, hsl(160, 76%, 46%) 100%)',
      secondary: 'linear-gradient(135deg, hsl(160, 60%, 45%) 0%, hsl(180, 60%, 55%) 100%)',
      accent: 'linear-gradient(135deg, hsl(120, 70%, 50%) 0%, hsl(140, 70%, 60%) 100%)'
    }
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Orange',
    description: 'Tema naranja atardecer cálido',
    preview: '#f97316',
    colors: {
      primary: 'hsl(25, 95%, 53%)',
      secondary: 'hsl(15, 85%, 55%)',
      accent: 'hsl(35, 90%, 60%)',
      background: 'hsl(25, 15%, 97%)',
      surface: 'hsl(25, 10%, 95%)',
      text: 'hsl(25, 20%, 15%)',
      textSecondary: 'hsl(25, 15%, 45%)',
      border: 'hsl(25, 15%, 85%)',
      success: 'hsl(142, 76%, 36%)',
      warning: 'hsl(25, 95%, 53%)',
      error: 'hsl(0, 75%, 55%)',
      info: 'hsl(210, 100%, 45%)'
    },
    gradients: {
      primary: 'linear-gradient(135deg, hsl(25, 95%, 53%) 0%, hsl(15, 95%, 63%) 100%)',
      secondary: 'linear-gradient(135deg, hsl(15, 85%, 55%) 0%, hsl(5, 85%, 65%) 100%)',
      accent: 'linear-gradient(135deg, hsl(35, 90%, 60%) 0%, hsl(45, 90%, 70%) 100%)'
    }
  },
  purple: {
    id: 'purple',
    name: 'Royal Purple',
    description: 'Tema púrpura real elegante',
    preview: '#8b5cf6',
    colors: {
      primary: 'hsl(262, 83%, 58%)',
      secondary: 'hsl(280, 70%, 60%)',
      accent: 'hsl(300, 80%, 65%)',
      background: 'hsl(270, 15%, 97%)',
      surface: 'hsl(270, 10%, 95%)',
      text: 'hsl(270, 20%, 15%)',
      textSecondary: 'hsl(270, 15%, 45%)',
      border: 'hsl(270, 15%, 85%)',
      success: 'hsl(142, 76%, 36%)',
      warning: 'hsl(45, 90%, 55%)',
      error: 'hsl(0, 75%, 55%)',
      info: 'hsl(262, 83%, 58%)'
    },
    gradients: {
      primary: 'linear-gradient(135deg, hsl(262, 83%, 58%) 0%, hsl(280, 83%, 68%) 100%)',
      secondary: 'linear-gradient(135deg, hsl(280, 70%, 60%) 0%, hsl(300, 70%, 70%) 100%)',
      accent: 'linear-gradient(135deg, hsl(300, 80%, 65%) 0%, hsl(320, 80%, 75%) 100%)'
    }
  },
  dark: {
    id: 'dark',
    name: 'Dark Mode',
    description: 'Tema oscuro profesional',
    preview: '#1f2937',
    colors: {
      primary: 'hsl(210, 100%, 60%)',
      secondary: 'hsl(210, 15%, 70%)',
      accent: 'hsl(25, 100%, 60%)',
      background: 'hsl(220, 13%, 9%)',
      surface: 'hsl(220, 13%, 12%)',
      text: 'hsl(210, 40%, 95%)',
      textSecondary: 'hsl(210, 15%, 70%)',
      border: 'hsl(220, 13%, 20%)',
      success: 'hsl(142, 76%, 46%)',
      warning: 'hsl(38, 92%, 60%)',
      error: 'hsl(0, 84%, 70%)',
      info: 'hsl(210, 100%, 60%)'
    },
    gradients: {
      primary: 'linear-gradient(135deg, hsl(210, 100%, 60%) 0%, hsl(220, 100%, 70%) 100%)',
      secondary: 'linear-gradient(135deg, hsl(210, 15%, 70%) 0%, hsl(220, 15%, 80%) 100%)',
      accent: 'linear-gradient(135deg, hsl(25, 100%, 60%) 0%, hsl(35, 100%, 70%) 100%)'
    }
  }
};

// Clave para localStorage
const THEME_STORAGE_KEY = 'superset-theme';

// Obtener tema actual del localStorage o usar por defecto
export const getCurrentTheme = (): ThemeConfig => {
  if (typeof window === 'undefined') return THEMES.superset;
  
  const savedThemeId = localStorage.getItem(THEME_STORAGE_KEY);
  return THEMES[savedThemeId || 'superset'] || THEMES.superset;
};

// Guardar tema en localStorage
export const setCurrentTheme = (themeId: string): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(THEME_STORAGE_KEY, themeId);
  
  // Disparar evento personalizado para notificar cambios
  window.dispatchEvent(new CustomEvent('themeChanged', {
    detail: { theme: THEMES[themeId] || THEMES.superset }
  }));
};

// Aplicar tema al CSS del documento
export const applyThemeToDocument = (theme: ThemeConfig): void => {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  
  // Aplicar variables CSS
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
  
  Object.entries(theme.gradients).forEach(([key, value]) => {
    root.style.setProperty(`--gradient-${key}`, value);
  });
  
  // Aplicar clase de tema
  root.className = root.className.replace(/theme-\w+/g, '');
  root.classList.add(`theme-${theme.id}`);
};

// Hook personalizado para manejo de temas
export const useTheme = () => {
  const [currentTheme, setCurrentThemeState] = useState<ThemeConfig>(() => getCurrentTheme());
  
  useEffect(() => {
    const handleThemeChange = (event: CustomEvent) => {
      setCurrentThemeState(event.detail.theme);
      applyThemeToDocument(event.detail.theme);
    };
    
    window.addEventListener('themeChanged', handleThemeChange as EventListener);
    
    // Aplicar tema inicial
    applyThemeToDocument(currentTheme);
    
    return () => {
      window.removeEventListener('themeChanged', handleThemeChange as EventListener);
    };
  }, []);
  
  const setTheme = (themeId: string) => {
    setCurrentTheme(themeId);
    setCurrentThemeState(THEMES[themeId] || THEMES.superset);
  };
  
  return {
    currentTheme,
    setTheme,
    availableThemes: Object.values(THEMES),
    applyTheme: applyThemeToDocument
  };
};