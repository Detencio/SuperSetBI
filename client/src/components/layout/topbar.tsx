import { RefreshCw, Calendar, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TopBarProps {
  title: string;
  subtitle: string;
  onRefresh?: () => void;
  onMenuClick?: () => void;
}

export default function TopBar({ title, subtitle, onRefresh, onMenuClick }: TopBarProps) {
  return (
    <header className="bg-card shadow-sm border-b border-gray-200 p-4 lg:p-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden text-text-secondary hover:text-text-primary"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-text-primary">{title}</h1>
            <p className="text-text-secondary mt-1 text-sm lg:text-base hidden sm:block">{subtitle}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* Date Range Picker */}
          <div className="hidden md:flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-text-secondary" />
            <Select defaultValue="30days">
              <SelectTrigger className="w-[140px] lg:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30days">Últimos 30 días</SelectItem>
                <SelectItem value="3months">Últimos 3 meses</SelectItem>
                <SelectItem value="6months">Últimos 6 meses</SelectItem>
                <SelectItem value="1year">Último año</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Refresh Button */}
          <Button 
            onClick={onRefresh}
            className="bg-superset-blue hover:bg-blue-600 text-white"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 lg:mr-2" />
            <span className="hidden lg:inline">Actualizar</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
