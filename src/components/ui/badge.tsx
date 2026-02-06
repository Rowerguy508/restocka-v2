import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Status badges
        verde: "border-status-success bg-status-success-bg text-status-success",
        amarillo: "border-status-warning bg-status-warning-bg text-status-warning",
        rojo: "border-status-danger bg-status-danger-bg text-status-danger",
        // PO Status badges
        draft: "border-muted-foreground/30 bg-muted text-muted-foreground",
        sent: "border-primary/30 bg-primary/10 text-primary",
        delivered: "border-status-success bg-status-success-bg text-status-success",
        problem: "border-status-danger bg-status-danger-bg text-status-danger",
        canceled: "border-muted-foreground/30 bg-muted/50 text-muted-foreground line-through",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
