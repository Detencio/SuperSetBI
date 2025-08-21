import { Link, useLocation } from "wouter";
import { 
  BarChart3, 
  Package, 
  CreditCard, 
  TrendingUp, 
  Settings, 
  Users, 
  LogOut 
} from "lucide-react";

const navigation = [
  { name: "Resumen Ejecutivo", href: "/dashboard", icon: BarChart3, current: true },
];

const modules = [
  { name: "Control de Inventario", href: "/inventory", icon: Package },
  { name: "Gestión de Cobranza", href: "/collections", icon: CreditCard },
  { name: "Seguimiento de Ventas", href: "/sales", icon: TrendingUp },
];

const settings = [
  { name: "Configuración", href: "/settings", icon: Settings },
  { name: "Usuarios", href: "/users", icon: Users },
];

export default function Sidebar() {
  const [location] = useLocation();

  const isActive = (href: string) => {
    if (href === "/dashboard" && (location === "/" || location === "/dashboard")) {
      return true;
    }
    return location === href;
  };

  return (
    <div className="w-64 bg-card shadow-lg flex flex-col">
      {/* Logo Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-superset-blue rounded-lg flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Superset BI</h1>
            <p className="text-sm text-text-secondary">Business Intelligence</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        <div className="mb-6">
          <h3 className="text-xs uppercase font-semibold text-text-secondary mb-3 tracking-wider">
            Dashboard Principal
          </h3>
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? "bg-superset-blue text-white"
                    : "text-text-primary hover:bg-gray-100"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="mb-6">
          <h3 className="text-xs uppercase font-semibold text-text-secondary mb-3 tracking-wider">
            Módulos
          </h3>
          <div className="space-y-1">
            {modules.map((item) => {
              const Icon = item.icon;
              const iconColor = item.name.includes("Inventario") 
                ? "text-superset-teal" 
                : item.name.includes("Cobranza")
                ? "text-superset-orange"
                : "text-success";

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? "bg-superset-blue text-white"
                      : "text-text-primary hover:bg-gray-100"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive(item.href) ? "text-white" : iconColor}`} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-xs uppercase font-semibold text-text-secondary mb-3 tracking-wider">
            Configuración
          </h3>
          <div className="space-y-1">
            {settings.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? "bg-superset-blue text-white"
                      : "text-text-primary hover:bg-gray-100"
                  }`}
                >
                  <Icon className="h-5 w-5 text-text-secondary" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-superset-teal rounded-full flex items-center justify-center">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-text-primary">María González</p>
            <p className="text-sm text-text-secondary">Administrador</p>
          </div>
          <button className="text-text-secondary hover:text-text-primary">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
