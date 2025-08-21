import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface CollectionStatusProps {
  status: {
    paid: number;
    pending: number;
    overdue: number;
    total: number;
  };
}

export default function CollectionStatus({ status }: CollectionStatusProps) {
  const getPercentage = (value: number) => {
    return status.total > 0 ? Math.round((value / status.total) * 100) : 0;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-text-primary">
          Estado de Cobranza
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-success bg-opacity-10 rounded-lg">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-success" />
              <div>
                <p className="font-medium text-text-primary">Al día</p>
                <p className="text-sm text-text-secondary">{status.paid} clientes</p>
              </div>
            </div>
            <span className="text-lg font-bold text-success">{getPercentage(status.paid)}%</span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-warning bg-opacity-10 rounded-lg">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <div>
                <p className="font-medium text-text-primary">Vencido (1-30 días)</p>
                <p className="text-sm text-text-secondary">{status.pending} clientes</p>
              </div>
            </div>
            <span className="text-lg font-bold text-warning">{getPercentage(status.pending)}%</span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-danger bg-opacity-10 rounded-lg">
            <div className="flex items-center space-x-3">
              <XCircle className="h-5 w-5 text-danger" />
              <div>
                <p className="font-medium text-text-primary">Vencido (+30 días)</p>
                <p className="text-sm text-text-secondary">{status.overdue} clientes</p>
              </div>
            </div>
            <span className="text-lg font-bold text-danger">{getPercentage(status.overdue)}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
