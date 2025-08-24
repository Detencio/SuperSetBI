import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  variant?: "fade" | "slide" | "scale" | "none";
  delay?: number;
}

const variants = {
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  },
  slide: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },
  scale: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  },
  none: {
    hidden: {},
    visible: {},
    exit: {}
  }
};

export function ResponsiveContainer({ 
  children, 
  className = "", 
  variant = "fade",
  delay = 0 
}: ResponsiveContainerProps) {
  return (
    <motion.div
      className={`responsive-container ${className}`}
      variants={variants[variant]}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{
        duration: 0.3,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      style={{
        transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
      }}
    >
      {children}
    </motion.div>
  );
}

export default ResponsiveContainer;