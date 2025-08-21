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
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-text-secondary text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-text-primary mt-2">{value}</p>
            <div className="flex items-center mt-2 space-x-1">
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-success" />
              ) : (
                <TrendingDown className="h-4 w-4 text-danger" />
              )}
              <span className={`text-sm font-medium ${isPositive ? 'text-success' : 'text-danger'}`}>
                {isPositive ? '+' : ''}{change.toFixed(1)}%
              </span>
              <span className="text-text-secondary text-sm">vs mes anterior</span>
            </div>
          </div>
          <div className={`w-12 h-12 ${iconBgColor} bg-opacity-10 rounded-lg flex items-center justify-center`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
