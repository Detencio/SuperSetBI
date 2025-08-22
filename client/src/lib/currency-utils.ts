// Utilidades para manejo de monedas y conversión
export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  locale: string;
}

// Configuración de monedas soportadas
export const CURRENCIES: Record<string, CurrencyConfig> = {
  CLP: {
    code: 'CLP',
    symbol: '$',
    name: 'Peso Chileno',
    locale: 'es-CL'
  },
  USD: {
    code: 'USD',
    symbol: 'US$',
    name: 'Dólar Estadounidense',
    locale: 'en-US'
  }
};

// Tipo de cambio simulado (en producción vendría de una API)
export const EXCHANGE_RATES = {
  CLP_TO_USD: 0.0011, // 1 CLP = 0.0011 USD (aproximadamente)
  USD_TO_CLP: 900     // 1 USD = 900 CLP (aproximadamente)
};

// Obtener configuración de moneda actual del localStorage o por defecto CLP
export const getCurrentCurrency = (): CurrencyConfig => {
  const stored = localStorage.getItem('preferred_currency');
  return CURRENCIES[stored || 'CLP'] || CURRENCIES.CLP;
};

// Establecer moneda preferida
export const setCurrentCurrency = (currencyCode: string): void => {
  if (CURRENCIES[currencyCode]) {
    localStorage.setItem('preferred_currency', currencyCode);
    // Disparar evento para que los componentes se actualicen
    window.dispatchEvent(new CustomEvent('currencyChanged', { 
      detail: { currency: CURRENCIES[currencyCode] }
    }));
  }
};

// Convertir monto entre monedas
export const convertCurrency = (
  amount: number, 
  fromCurrency: string, 
  toCurrency: string
): number => {
  if (fromCurrency === toCurrency) return amount;
  
  if (fromCurrency === 'CLP' && toCurrency === 'USD') {
    return amount * EXCHANGE_RATES.CLP_TO_USD;
  }
  
  if (fromCurrency === 'USD' && toCurrency === 'CLP') {
    return amount * EXCHANGE_RATES.USD_TO_CLP;
  }
  
  return amount; // Por defecto no convierte
};

// Formatear monto en moneda específica con formato chileno
export const formatCurrency = (
  amount: number | string, 
  currencyCode?: string,
  options?: {
    showSymbol?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  const currency = currencyCode ? CURRENCIES[currencyCode] : getCurrentCurrency();
  
  if (isNaN(numericAmount)) return '0';
  
  const formatOptions: Intl.NumberFormatOptions = {
    minimumFractionDigits: options?.minimumFractionDigits ?? 0,
    maximumFractionDigits: options?.maximumFractionDigits ?? 0,
  };
  
  let formattedNumber: string;
  
  if (currency.code === 'CLP') {
    // Formato chileno: 15.289,08
    formattedNumber = numericAmount.toLocaleString('es-CL', formatOptions);
  } else if (currency.code === 'USD') {
    // Formato estadounidense: 15,289.08
    formattedNumber = numericAmount.toLocaleString('en-US', formatOptions);
  } else {
    formattedNumber = numericAmount.toLocaleString(currency.locale, formatOptions);
  }
  
  return options?.showSymbol !== false 
    ? `${currency.symbol} ${formattedNumber}` 
    : formattedNumber;
};

// Formatear específicamente en pesos chilenos
export const formatCLP = (amount: number | string, decimals: number = 0): string => {
  return formatCurrency(amount, 'CLP', { 
    showSymbol: true, 
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals 
  });
};

// Formatear específicamente en dólares estadounidenses
export const formatUSD = (amount: number | string, decimals: number = 2): string => {
  return formatCurrency(amount, 'USD', { 
    showSymbol: true, 
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals 
  });
};

// Formatear con conversión automática
export const formatCurrencyWithConversion = (
  amountInCLP: number | string, 
  targetCurrency?: string
): { 
  original: string; 
  converted?: string; 
  rate?: number 
} => {
  const amount = typeof amountInCLP === 'string' ? parseFloat(amountInCLP) : amountInCLP;
  const target = targetCurrency || getCurrentCurrency().code;
  
  const result: any = {
    original: formatCLP(amount)
  };
  
  if (target !== 'CLP') {
    const convertedAmount = convertCurrency(amount, 'CLP', target);
    result.converted = formatCurrency(convertedAmount, target, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
    result.rate = target === 'USD' ? EXCHANGE_RATES.CLP_TO_USD : 1;
  }
  
  return result;
};

// Parsear string de moneda chilena a número
export const parseCurrencyString = (currencyString: string): number => {
  // Remover símbolos de moneda y espacios
  let cleanString = currencyString
    .replace(/[$US\s]/g, '')
    .trim();
  
  // Si contiene punto y coma, asumimos formato chileno (15.289,08)
  if (cleanString.includes('.') && cleanString.includes(',')) {
    // Formato chileno: remover puntos (separador de miles) y reemplazar coma por punto
    cleanString = cleanString.replace(/\./g, '').replace(',', '.');
  }
  // Si solo contiene comas, asumir formato estadounidense (15,289.08)
  else if (cleanString.includes(',') && !cleanString.includes('.')) {
    // Formato estadounidense: remover comas (separador de miles)
    cleanString = cleanString.replace(/,/g, '');
  }
  // Si contiene coma al final, formato chileno (15.289,08)
  else if (cleanString.lastIndexOf(',') > cleanString.lastIndexOf('.')) {
    cleanString = cleanString.replace(/\./g, '').replace(',', '.');
  }
  
  return parseFloat(cleanString) || 0;
};

// Hook personalizado para manejo de monedas (para usar en React)
export const useCurrency = () => {
  const getCurrentCurrencyState = () => getCurrentCurrency();
  
  return {
    currentCurrency: getCurrentCurrencyState(),
    setCurrency: setCurrentCurrency,
    formatCurrency,
    formatCLP,
    formatUSD,
    convertCurrency,
    formatCurrencyWithConversion,
    parseCurrencyString,
    availableCurrencies: Object.values(CURRENCIES)
  };
};