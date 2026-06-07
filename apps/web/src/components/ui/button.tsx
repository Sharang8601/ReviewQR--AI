import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type ButtonVariant = "default" | "outline" | "ghost";
type ButtonSize = "default" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variants: Record<ButtonVariant, string> = {
  default: "bg-emerald-600 text-white shadow-lg shadow-emerald-950/15 hover:bg-emerald-500",
  outline: "border border-slate-200/80 bg-white/80 text-slate-800 shadow-sm hover:bg-white",
  ghost: "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
};

const sizes: Record<ButtonSize, string> = {
  default: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base"
};

export function Button({ className, variant = "default", size = "default", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition duration-200 ease-out hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-55",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
