import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ children, variant = "primary", className = "", ...props }: Props) {
  const variants = {
    primary: "bg-fern text-white hover:bg-[#25594c]",
    secondary: "bg-white text-ink border border-[#d9e2dd] hover:bg-[#f9fbfa]",
    ghost: "bg-transparent text-ink hover:bg-white/70"
  };

  return (
    <button
      className={`focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-55 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

