import type { HTMLAttributes } from "react";
import { cn } from "../lib/utils";

export function GlassCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[24px] border border-white/30 bg-white/12 shadow-glass backdrop-blur-glass",
        className
      )}
      {...props}
    />
  );
}
