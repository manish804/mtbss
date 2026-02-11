import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:text-white",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:text-white",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:text-white",
        outline: "text-foreground hover:text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, style, ...props }: BadgeProps) {
  const badgeStyle = {
    ...style,
    '--hover-bg': '#8dcbdb',
    '--hover-border': '#8dcbdb',
  } as React.CSSProperties & { [key: string]: string }

  return (
    <div 
      className={cn(
        badgeVariants({ variant }),
        "hover:[background-color:var(--hover-bg)] hover:[border-color:var(--hover-border)]",
        className
      )} 
      style={badgeStyle}
      {...props} 
    />
  )
}

export { Badge, badgeVariants }