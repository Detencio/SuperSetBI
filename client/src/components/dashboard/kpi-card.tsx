import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="overflow-hidden bg-gradient-to-br from-white via-white to-gray-50/30 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <motion.p 
                className="text-text-secondary text-xs font-semibold mb-3 tracking-widest uppercase"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {title}
              </motion.p>
              <motion.p 
                className="text-4xl font-bold text-text-primary mt-2 font-mono tracking-tight leading-none"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
              >
                {value}
              </motion.p>
              <motion.div 
                className="flex items-center mt-4 space-x-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <motion.div 
                  className={`flex items-center justify-center w-6 h-6 rounded-full ${
                    isPositive ? 'bg-green-100' : 'bg-red-100'
                  }`}
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                  >
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3 text-success" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-danger" />
                    )}
                  </motion.div>
                </motion.div>
                <motion.span 
                  className={`text-sm font-bold ${isPositive ? 'text-success' : 'text-danger'}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {isPositive ? '+' : ''}{change.toFixed(1)}%
                </motion.span>
                <span className="text-text-secondary text-xs font-medium">vs mes anterior</span>
              </motion.div>
            </div>
            <motion.div 
              className={`w-16 h-16 ${iconBgColor} bg-opacity-15 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm`}
              whileHover={{ 
                scale: 1.1, 
                rotate: 5,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.1)"
              }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <motion.div 
                className="text-2xl"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
              >
                {icon}
              </motion.div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
