import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/comparison/a/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        clay: "bg-gradient-clay text-clay-foreground shadow-soft hover:brightness-[1.04] active:brightness-95 transition-[filter,transform] hover:-translate-y-0.5",
        ink: "bg-ink text-ink-foreground shadow-soft hover:bg-ink/90 hover:-translate-y-0.5 transition-[background-color,transform]",
        quiet:
          "border border-border bg-transparent text-foreground hover:bg-secondary hover:-translate-y-0.5 transition-[background-color,transform]",
        onink:
          "border border-ink-foreground/25 bg-transparent text-ink-foreground hover:bg-ink-foreground/10",
      },
      size: {
        default: "h-12 px-5 py-3",
        sm: "h-11 px-4 text-xs",
        lg: "h-12 px-7",
        xl: "h-14 px-8 text-[0.95rem] tracking-tight",
        pill: "h-14 px-8 text-[0.95rem] tracking-tight",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
