import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const variants = cva("inline-flex items-center justify-center rounded-xl text-sm font-semibold transition disabled:opacity-50", {
  variants: {
    variant: {
      default: "bg-brand text-white hover:bg-brand-dark",
      ghost: "bg-white text-slate-700 border border-slate-200",
      secondary: "bg-slate-900 text-white"
    },
    size: {
      default: "h-11 px-4",
      lg: "h-12 px-6"
    }
  },
  defaultVariants: { variant: "default", size: "default" }
});

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof variants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(variants({ variant, size }), className)} {...props} />;
}
