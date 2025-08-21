import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, AlertTriangle, CheckCircle } from "lucide-react";
import { Activity } from "@/lib/mock-data";

interface RecentActivitiesProps {
  activities: Activity[];
}

export default function RecentActivities({ activities }: RecentActivitiesProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'sale':
        return ShoppingCart;
      case 'stock':
        return AlertTriangle;
      case 'payment':
        return CheckCircle;
      default:
        return ShoppingCart;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'sale':
        return 'bg-superset-blue text-superset-blue';
      case 'stock':
        return 'bg-warning text-warning';
      case 'payment':
        return 'bg-success text-success';
      default:
        return 'bg-superset-blue text-superset-blue';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 60) {
      return `hace ${diffMins} minutos`;
    } else {
      const diffHours = Math.floor(diffMins / 60);
      return `hace ${diffHours} horas`;
    }
  };

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
        <CardTitle className="text-lg font-semibold text-text-primary">
          Actividad Reciente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = getIcon(activity.type);
            const iconColor = getIconColor(activity.type);
            
            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`w-8 h-8 ${iconColor.split(' ')[0]} bg-opacity-10 rounded-full flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`h-4 w-4 ${iconColor.split(' ')[1]}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">{activity.message}</p>
                  <p className="text-xs text-text-secondary">
                    {activity.amount && `${formatCurrency(activity.amount)} - `}
                    {formatTime(activity.timestamp)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
