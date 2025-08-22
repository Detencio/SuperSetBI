import { Link, useLocation } from "wouter";
import { 
  BarChart3, 
  Package, 
  CreditCard, 
  TrendingUp, 
  Settings, 
  Users, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

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

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const [location] = useLocation();

  const isActive = (href: string) => {
    if (href === "/dashboard" && (location === "/" || location === "/dashboard")) {
      return true;
    }
    return location === href;
  };

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
        w-64 bg-card shadow-lg flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Mobile Close Button */}
        <div className="lg:hidden flex justify-end p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Logo Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary tracking-tight">Superset</h1>
              <p className="text-sm text-text-secondary font-medium">Business Intelligence</p>
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
                onClick={handleLinkClick}
                className={`flex items-center space-x-3 p-4 rounded-xl transition-all duration-200 font-medium ${
                  isActive(item.href)
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                    : "text-text-primary hover:bg-blue-50 hover:text-blue-600"
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
                  onClick={handleLinkClick}
                  className={`flex items-center space-x-3 p-4 rounded-xl transition-all duration-200 font-medium ${
                    isActive(item.href)
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                      : "text-text-primary hover:bg-blue-50 hover:text-blue-600"
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
                  onClick={handleLinkClick}
                  className={`flex items-center space-x-3 p-4 rounded-xl transition-all duration-200 font-medium ${
                    isActive(item.href)
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                      : "text-text-primary hover:bg-blue-50 hover:text-blue-600"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive(item.href) ? "text-white" : "text-text-secondary"}`} />
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
    </>
  );
}
