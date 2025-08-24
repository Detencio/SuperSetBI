import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <motion.div
      className="h-full bg-primary rounded-full relative overflow-hidden"
      initial={{ width: 0 }}
      animate={{ width: `${value || 0}%` }}
      transition={{ 
        duration: 0.8, 
        ease: "easeOut",
        delay: 0.2
      }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{ x: ["-100%", "100%"] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
          delay: 0.5
        }}
        style={{ width: "50%" }}
      />
    </motion.div>
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }