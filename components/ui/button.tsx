import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default: "bg-primary-500 hover:bg-primary-600 text-white shadow-sm hover:scale-105",
        secondary: "bg-gradient-to-r from-secondary-500 to-secondary-600 text-white shadow-sm hover:from-secondary-600 hover:to-secondary-700 hover:shadow-md hover:shadow-secondary-500/20",
        outline: "border border-neutral-300 bg-white/80 backdrop-blur-sm hover:bg-white hover:border-primary-300 hover:text-primary-600 hover:shadow-sm",
        ghost: "hover:bg-primary-50 hover:text-primary-600",
        accent: "bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-sm hover:from-accent-600 hover:to-accent-700 hover:shadow-md hover:shadow-accent-500/20",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-xl px-3 text-xs",
        lg: "h-12 rounded-2xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }