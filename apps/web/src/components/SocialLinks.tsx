import {
  Facebook,
  Instagram,
  Linkedin,
  MessageCircle,
  Send,
  Twitter,
  Youtube,
  type LucideIcon
} from "lucide-react";
import type { Business } from "../lib/api";
import { cn } from "../lib/utils";

type SocialLinksProps = {
  business: Business;
  size?: "sm" | "md";
  className?: string;
};

function TikTokIcon({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
    </svg>
  );
}

type SocialItem = {
  key: string;
  href: string;
  label: string;
  icon: LucideIcon | typeof TikTokIcon;
};

function buildSocialItems(business: Business): SocialItem[] {
  const items: SocialItem[] = [];

  if (business.instagramUrl) {
    items.push({ key: "instagram", href: business.instagramUrl, label: "Instagram", icon: Instagram });
  }
  if (business.facebookUrl) {
    items.push({ key: "facebook", href: business.facebookUrl, label: "Facebook", icon: Facebook });
  }
  if (business.twitterUrl) {
    items.push({ key: "twitter", href: business.twitterUrl, label: "X (Twitter)", icon: Twitter });
  }
  if (business.linkedinUrl) {
    items.push({ key: "linkedin", href: business.linkedinUrl, label: "LinkedIn", icon: Linkedin });
  }
  if (business.youtubeUrl) {
    items.push({ key: "youtube", href: business.youtubeUrl, label: "YouTube", icon: Youtube });
  }
  if (business.tiktokUrl) {
    items.push({ key: "tiktok", href: business.tiktokUrl, label: "TikTok", icon: TikTokIcon });
  }
  if (business.whatsappNumber) {
    const digits = business.whatsappNumber.replace(/\D/g, "");
    items.push({
      key: "whatsapp",
      href: `https://wa.me/${digits}`,
      label: "WhatsApp",
      icon: MessageCircle
    });
  }
  if (business.telegramUrl) {
    items.push({ key: "telegram", href: business.telegramUrl, label: "Telegram", icon: Send });
  }

  return items;
}

export function SocialLinks({ business, size = "md", className }: SocialLinksProps) {
  const items = buildSocialItems(business);

  if (!items.length) return null;

  const buttonSize = size === "sm" ? "h-9 w-9" : "h-11 w-11";
  const iconSize = size === "sm" ? 16 : 18;

  return (
    <div className={cn("flex flex-wrap justify-center gap-2 sm:justify-start", className)}>
      {items.map((item) => (
        <a
          key={item.key}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={item.label}
          className={cn(
            buttonSize,
            "inline-flex items-center justify-center rounded-full border border-emerald-100 bg-white text-emerald-700 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:shadow-md"
          )}
        >
          <item.icon size={iconSize} className="flex-shrink-0" />
        </a>
      ))}
    </div>
  );
}

export function hasSocialLinks(business: Business) {
  return buildSocialItems(business).length > 0;
}
