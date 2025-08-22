import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Download, Expand } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InventoryChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
}

const COLORS = [
  'hsl(210, 100%, 56%)', // superset-blue
  'hsl(174, 72%, 56%)',  // superset-teal
  'hsl(16, 100%, 66%)',  // superset-orange
  'hsl(120, 60%, 50%)',  // success
  'hsl(45, 93%, 47%)',   // warning
];

export default function InventoryChart({ data }: InventoryChartProps) {
  return (
    <Card className="card-hover shadow-md border-0">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-text-primary tracking-tight">
              Distribución de Inventario
            </CardTitle>
            <p className="text-text-secondary text-sm font-medium mt-1">
              Por categoría de producto
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-text-secondary hover:text-blue-600 rounded-xl">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-text-secondary hover:text-blue-600 rounded-xl">
              <Expand className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value} unidades`,
                  name
                ]}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e8e8e8',
                  borderRadius: '8px'
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
