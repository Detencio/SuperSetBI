import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface KPICardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  iconBgColor: string;
}

export default function KPICard({ title, value, change, icon, iconBgColor }: KPICardProps) {
  const isPositive = change >= 0;
  
  return (
    <Card className="card-hover kpi-card group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-text-secondary text-xs font-semibold mb-3 tracking-widest uppercase">{title}</p>
            <p className="text-4xl font-bold text-text-primary mt-2 font-mono tracking-tight leading-none">{value}</p>
            <div className="flex items-center mt-4 space-x-2">
              <div className={`flex items-center justify-center w-6 h-6 rounded-full ${
                isPositive ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {isPositive ? (
                  <TrendingUp className="h-3 w-3 text-success" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-danger" />
                )}
              </div>
              <span className={`text-sm font-bold ${isPositive ? 'text-success' : 'text-danger'}`}>
                {isPositive ? '+' : ''}{change.toFixed(1)}%
              </span>
              <span className="text-text-secondary text-xs font-medium">vs mes anterior</span>
            </div>
          </div>
          <div className={`w-16 h-16 ${iconBgColor} bg-opacity-15 rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200 group-hover:scale-105`}>
            <div className="text-2xl">
              {icon}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
