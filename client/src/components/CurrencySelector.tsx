import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp } from "lucide-react";
import { 
  getCurrentCurrency, 
  setCurrentCurrency, 
  CURRENCIES, 
  EXCHANGE_RATES,
  type CurrencyConfig 
} from "@/lib/currency-utils";

interface CurrencySelectorProps {
  variant?: "dropdown" | "toggle" | "badge";
  size?: "sm" | "default" | "lg";
  showExchangeRate?: boolean;
  className?: string;
}

export default function CurrencySelector({ 
  variant = "dropdown", 
  size = "default",
  showExchangeRate = true,
  className = ""
}: CurrencySelectorProps) {
  const [currentCurrency, setCurrentCurrencyState] = useState<CurrencyConfig>(getCurrentCurrency());

  useEffect(() => {
    const handleCurrencyChange = (event: CustomEvent) => {
      setCurrentCurrencyState(event.detail.currency);
    };

    window.addEventListener('currencyChanged', handleCurrencyChange as EventListener);
    return () => {
      window.removeEventListener('currencyChanged', handleCurrencyChange as EventListener);
    };
  }, []);

  const handleCurrencyChange = (currencyCode: string) => {
    setCurrentCurrency(currencyCode);
    setCurrentCurrencyState(CURRENCIES[currencyCode]);
  };

  const getExchangeRateText = () => {
    if (currentCurrency.code === 'CLP') {
      return `1 USD = $${EXCHANGE_RATES.USD_TO_CLP.toLocaleString('es-CL')}`;
    } else {
      return `1 CLP = US$${EXCHANGE_RATES.CLP_TO_USD.toFixed(4)}`;
    }
  };

  // Variante Dropdown
  if (variant === "dropdown") {
    return (
      <div className={`flex flex-col gap-1 ${className}`}>
        <Select 
          value={currentCurrency.code} 
          onValueChange={handleCurrencyChange}
        >
          <SelectTrigger 
            className={`w-full ${
              size === "sm" ? "h-8 text-xs" : 
              size === "lg" ? "h-12 text-base" : "h-10 text-sm"
            }`}
            data-testid="currency-selector-dropdown"
          >
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <SelectValue placeholder="Seleccionar moneda" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {Object.values(CURRENCIES).map((currency) => (
              <SelectItem 
                key={currency.code} 
                value={currency.code}
                data-testid={`currency-option-${currency.code}`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{currency.symbol}</span>
                  <span>{currency.name}</span>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {currency.code}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {showExchangeRate && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            <span>{getExchangeRateText()}</span>
          </div>
        )}
      </div>
    );
  }

  // Variante Toggle (botones)
  if (variant === "toggle") {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          {Object.values(CURRENCIES).map((currency) => (
            <Button
              key={currency.code}
              variant={currentCurrency.code === currency.code ? "default" : "ghost"}
              size={size === "sm" ? "sm" : "default"}
              onClick={() => handleCurrencyChange(currency.code)}
              className={`flex-1 ${
                size === "sm" ? "h-7 text-xs px-2" : "h-9 text-sm px-3"
              }`}
              data-testid={`currency-toggle-${currency.code}`}
            >
              <span className="font-medium">{currency.symbol}</span>
              <span className="ml-1">{currency.code}</span>
            </Button>
          ))}
        </div>
        
        {showExchangeRate && (
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            <span>{getExchangeRateText()}</span>
          </div>
        )}
      </div>
    );
  }

  // Variante Badge (solo lectura con info)
  if (variant === "badge") {
    return (
      <div className={`flex flex-col gap-1 ${className}`}>
        <Badge 
          variant="outline" 
          className={`flex items-center gap-2 w-fit ${
            size === "sm" ? "text-xs px-2 py-1" : 
            size === "lg" ? "text-base px-4 py-2" : "text-sm px-3 py-1.5"
          }`}
          data-testid="currency-badge"
        >
          <DollarSign className="h-3 w-3" />
          <span className="font-medium">{currentCurrency.symbol}</span>
          <span>{currentCurrency.code}</span>
        </Badge>
        
        {showExchangeRate && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            <span>{getExchangeRateText()}</span>
          </div>
        )}
      </div>
    );
  }

  return null;
}