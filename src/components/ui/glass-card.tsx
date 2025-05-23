import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'featured' | 'subtle';
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variantStyles = {
      default: "backdrop-blur-md bg-white/30 border border-white/20 shadow-lg",
      featured: "backdrop-blur-lg bg-white/40 border border-white/30 shadow-xl",
      subtle: "backdrop-blur-sm bg-white/20 border border-white/10 shadow"
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg p-6 transition-all duration-300",
          variantStyles[variant],
          className
        )}
        {...props}
      />
    );
  }
);

GlassCard.displayName = "GlassCard";

export { GlassCard }; 