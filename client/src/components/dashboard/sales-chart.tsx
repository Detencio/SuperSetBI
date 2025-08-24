import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Download, Expand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { RechartsEnhancedTooltip } from "@/components/ui/enhanced-tooltip";

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ scale: 1.01 }}
    >
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50 overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <CardTitle className="text-xl font-bold text-text-primary tracking-tight">
                  Tendencia de Ventas
                </CardTitle>
                <p className="text-text-secondary text-sm font-medium mt-1">
                  Ingresos por mes - Últimos 12 meses
                </p>
              </motion.div>
            </div>
            <motion.div 
              className="flex items-center space-x-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button variant="ghost" size="sm" className="text-text-secondary hover:text-blue-600 rounded-xl btn-pulse">
                  <Download className="h-4 w-4" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button variant="ghost" size="sm" className="text-text-secondary hover:text-blue-600 rounded-xl btn-pulse">
                  <Expand className="h-4 w-4" />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </CardHeader>
        <CardContent>
          <motion.div 
            style={{ height: 300 }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="chart-enter"
          >
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
                  content={<RechartsEnhancedTooltip />}
                  cursor={{ 
                    stroke: "hsl(var(--superset-blue))", 
                    strokeWidth: 2, 
                    strokeDasharray: "4 4",
                    opacity: 0.6
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--superset-blue))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--superset-blue))", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 8, stroke: "hsl(var(--superset-blue))", strokeWidth: 3, fill: "white" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
