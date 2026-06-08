import Image from "next/image";
import Link from "next/link";
import { cn } from "../lib/utils";

type LogoSize = "sm" | "md" | "lg" | "xl";

const sizeConfig: Record<
  LogoSize,
  { icon: string; text: string; image: number; subtitle?: string }
> = {
  sm: { icon: "h-12 w-12 rounded-xl", text: "text-base font-bold", image: 48, subtitle: "text-xs" },
  md: { icon: "h-14 w-14 rounded-2xl", text: "text-lg font-bold", image: 56, subtitle: "text-xs" },
  lg: { icon: "h-16 w-16 rounded-2xl", text: "text-xl font-bold", image: 64, subtitle: "text-sm" },
  xl: { icon: "h-[72px] w-[72px] rounded-2xl", text: "text-2xl font-bold", image: 72, subtitle: "text-sm" }
};

type LogoProps = {
  size?: LogoSize;
  showText?: boolean;
  subtitle?: string;
  href?: string;
  className?: string;
  centered?: boolean;
  inverted?: boolean;
};

export function Logo({
  size = "md",
  showText = true,
  subtitle,
  href,
  className,
  centered = false,
  inverted = false
}: LogoProps) {
  const config = sizeConfig[size];

  const content = (
    <div
      className={cn(
        "flex items-center gap-3",
        centered && "justify-center",
        className
      )}
    >
      <div className={cn("relative flex-shrink-0 overflow-hidden shadow-lg shadow-emerald-600/20", config.icon)}>
        <Image
          src="/logo.svg"
          alt="ReviewQR AI"
          width={config.image}
          height={config.image}
          className="h-full w-full object-cover"
          priority
        />
      </div>
      {showText ? (
        <div className={cn(centered && "text-center")}>
          <p className={cn("tracking-tight", inverted ? "text-white" : "text-slate-950", config.text)}>
            ReviewQR AI
          </p>
          {subtitle ? (
            <p className={cn(inverted ? "text-slate-300" : "text-slate-500", config.subtitle)}>{subtitle}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex transition-opacity hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
}
