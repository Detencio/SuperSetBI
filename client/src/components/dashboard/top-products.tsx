import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TopProduct {
  id: string;
  name: string;
  quantity: number;
  revenue: number;
}

interface TopProductsProps {
  products: TopProduct[];
}

export default function TopProducts({ products }: TopProductsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getBadgeColor = (index: number) => {
    const colors = [
      'bg-superset-blue',
      'bg-superset-teal',
      'bg-superset-orange',
      'bg-success',
      'bg-warning'
    ];
    return colors[index % colors.length];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-text-primary">
          Productos Top
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.map((product, index) => (
            <div key={product.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${getBadgeColor(index)} bg-opacity-10 rounded-lg flex items-center justify-center`}>
                  <span className={`text-white font-semibold text-sm ${getBadgeColor(index).replace('bg-', 'text-')}`}>
                    {index + 1}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-text-primary">{product.name}</p>
                  <p className="text-sm text-text-secondary">{product.quantity} unidades</p>
                </div>
              </div>
              <span className="text-sm font-medium text-success">
                {formatCurrency(product.revenue)}
              </span>
            </div>
          ))}
        </div>
        <Button 
          variant="ghost" 
          className="w-full mt-4 text-superset-blue hover:bg-superset-blue hover:bg-opacity-10"
        >
          Ver todos los productos
        </Button>
      </CardContent>
    </Card>
  );
}
