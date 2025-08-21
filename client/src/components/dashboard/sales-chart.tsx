import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Download, Expand } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SalesChartProps {
  data: Array<{
    month: string;
    revenue: number;
  }>;
}

export default function SalesChart({ data }: SalesChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-text-primary">
              Tendencia de Ventas
            </CardTitle>
            <p className="text-text-secondary text-sm">
              Ingresos por mes - Últimos 12 meses
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Expand className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                stroke="#8c8c8c"
                fontSize={12}
              />
              <YAxis 
                stroke="#8c8c8c"
                fontSize={12}
                tickFormatter={(value) => `$${(value / 1000)}K`}
              />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), 'Ingresos']}
                labelStyle={{ color: '#262626' }}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e8e8e8',
                  borderRadius: '8px'
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--superset-blue))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--superset-blue))", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "hsl(var(--superset-blue))", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
