import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-[24px] border border-white/70 bg-white/72 shadow-2xl shadow-slate-950/12 backdrop-blur-2xl", className)} {...props} />;
}
