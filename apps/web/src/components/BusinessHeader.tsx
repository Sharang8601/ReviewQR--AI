import Image from "next/image";
import { Sparkles } from "lucide-react";
import { cn } from "../lib/utils";

type BusinessHeaderSize = "sm" | "md" | "lg";

const logoSizeClasses: Record<BusinessHeaderSize, string> = {
  sm: "h-[60px] w-[60px] sm:h-[70px] sm:w-[70px]",
  md: "h-[70px] w-[70px] sm:h-[90px] sm:w-[90px] lg:h-[100px] lg:w-[100px]",
  lg: "h-[80px] w-[80px] sm:h-[100px] sm:w-[100px] lg:h-[120px] lg:w-[120px]"
};

type BusinessHeaderProps = {
  businessName: string;
  category?: string;
  logo?: string;
  description?: string;
  size?: BusinessHeaderSize;
  variant?: "card" | "inline" | "hero";
  className?: string;
};

export function BusinessHeader({
  businessName,
  category,
  logo,
  description,
  size = "lg",
  variant = "card",
  className
}: BusinessHeaderProps) {
  const logoClasses = cn(
    "flex-shrink-0 overflow-hidden rounded-2xl shadow-lg",
    logoSizeClasses[size]
  );

  const logoElement = logo ? (
    <Image
      src={logo}
      alt={`${businessName} logo`}
      width={120}
      height={120}
      unoptimized
      className={cn(logoClasses, "object-cover")}
    />
  ) : (
    <div
      className={cn(
        logoClasses,
        "flex items-center justify-center bg-emerald-100 text-emerald-700"
      )}
    >
      <Sparkles className="h-1/2 w-1/2" />
    </div>
  );

  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-4", className)}>
        {logoElement}
        <div className="min-w-0">
          {category ? (
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-emerald-600">
              {category}
            </p>
          ) : null}
          <h1 className="truncate text-xl font-bold text-slate-950 sm:text-2xl">{businessName}</h1>
        </div>
      </div>
    );
  }

  if (variant === "hero") {
    return (
      <div className={cn("flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left", className)}>
        {logoElement}
        <div className="mt-4 min-w-0 sm:mt-0 sm:ml-6">
          {category ? (
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-600">
              {category}
            </p>
          ) : null}
          <h1 className="text-2xl font-bold leading-tight text-slate-950 sm:text-3xl lg:text-4xl">
            {businessName}
          </h1>
          {description ? (
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">{description}</p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {logoElement}
      {category ? (
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">{category}</p>
      ) : null}
      <h1 className="text-2xl font-bold leading-tight text-slate-950 sm:text-3xl">{businessName}</h1>
      {description ? <p className="text-sm leading-relaxed text-slate-600 sm:text-base">{description}</p> : null}
    </div>
  );
}
