import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Package, FileText, BarChart3 } from "lucide-react";

const actions = [
  {
    name: "Nueva Venta",
    icon: Plus,
    color: "bg-superset-blue hover:bg-blue-600"
  },
  {
    name: "Gestionar Inventario",
    icon: Package,
    color: "bg-superset-teal hover:bg-teal-600"
  },
  {
    name: "Generar Factura",
    icon: FileText,
    color: "bg-superset-orange hover:bg-orange-600"
  },
  {
    name: "Ver Reportes",
    icon: BarChart3,
    color: "bg-success hover:bg-green-600"
  }
];

export default function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-text-primary">
          Acciones Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.name}
                className={`p-4 ${action.color} text-white flex flex-col items-center space-y-2 h-auto transition-colors`}
              >
                <Icon className="h-6 w-6" />
                <span className="text-sm font-medium">{action.name}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
