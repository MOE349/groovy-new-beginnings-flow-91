import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 active:shadow-inner rounded-[4px]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-[4px]",
        outline:
          "border border-primary text-primary bg-transparent hover:bg-primary/10 rounded-[4px]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-[4px]", 
        ghost: "hover:bg-accent hover:text-accent-foreground rounded-[4px]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "px-6 py-3 text-body",
        sm: "px-4 py-2 text-caption",
        lg: "px-8 py-4 text-body",
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
