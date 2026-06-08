import Image from "next/image";
import type { ReactNode } from "react";
import {
  Award,
  Clock,
  Globe,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Users
} from "lucide-react";
import type { Business } from "../lib/api";
import { hasSocialLinks, SocialLinks } from "./SocialLinks";
import { cn } from "../lib/utils";

const REVIEW_CTA =
  "Share your real experience. We'll turn your feedback into a clear review you can copy to Google.";

type BusinessProfileCardProps = {
  business: Business;
  className?: string;
};

function ContactRow({
  icon: Icon,
  href,
  children
}: {
  icon: typeof MapPin;
  href?: string;
  children: ReactNode;
}) {
  const content = (
    <span className="inline-flex items-start gap-2.5 text-sm text-slate-600">
      <Icon size={16} className="mt-0.5 flex-shrink-0 text-emerald-600" />
      <span className="break-words">{children}</span>
    </span>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="transition hover:text-emerald-700">
        {content}
      </a>
    );
  }

  return content;
}

export function BusinessProfileCard({ business, className }: BusinessProfileCardProps) {
  const showDescription =
    business.showDescription !== false && Boolean(business.businessDescription?.trim());
  const showContact = business.showContactInfo !== false;
  const showSocial = business.showSocialLinks !== false && hasSocialLinks(business);
  const showTrust = business.showTrustInfo !== false;

  const trustStatement =
    business.trustStatement?.trim() || "Trusted by hundreds of happy customers.";

  const hasContact =
    showContact &&
    Boolean(
      business.address ||
        business.phone ||
        business.email ||
        business.website ||
        business.googleMapsUrl ||
        business.workingHours
    );

  const hasTrustDetails =
    showTrust &&
    Boolean(
      business.yearsInBusiness ||
        business.customersServed ||
        business.awardsCertifications ||
        business.foundedYear
    );

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="flex flex-1 flex-col">
        <div className="mb-6 flex justify-center">
          {business.logo ? (
            <Image
              src={business.logo}
              alt={`${business.businessName} logo`}
              width={180}
              height={180}
              unoptimized
              className="h-20 w-20 rounded-full border-4 border-white object-cover shadow-xl shadow-emerald-900/10 sm:h-[100px] sm:w-[100px] lg:h-[160px] lg:w-[160px]"
            />
          ) : (
            <div className="flex h-[80px] w-[80px] items-center justify-center rounded-full border-4 border-white bg-emerald-100 text-emerald-700 shadow-xl sm:h-[100px] sm:w-[100px] lg:h-[160px] lg:w-[160px]">
              <Sparkles className="h-10 w-10 lg:h-14 lg:w-14" />
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
            {business.category}
          </p>
          <h1 className="text-2xl font-bold leading-tight text-slate-950 sm:text-3xl lg:text-4xl">
            {business.businessName}
          </h1>
          {business.tagline ? (
            <p className="mt-2 text-base font-medium text-emerald-700 sm:text-lg">{business.tagline}</p>
          ) : null}
        </div>

        {showDescription ? (
          <p className="mt-5 text-center text-sm leading-7 text-slate-600 sm:text-base">
            {business.businessDescription}
          </p>
        ) : null}

        {hasContact ? (
          <>
            <div className="my-6 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
            <div className="mx-auto w-full max-w-sm space-y-3 text-left">
              {business.address ? (
                <ContactRow icon={MapPin} href={business.googleMapsUrl || undefined}>
                  {business.address}
                </ContactRow>
              ) : null}
              {business.phone ? (
                <ContactRow icon={Phone} href={`tel:${business.phone}`}>
                  {business.phone}
                </ContactRow>
              ) : null}
              {business.email ? (
                <ContactRow icon={Mail} href={`mailto:${business.email}`}>
                  {business.email}
                </ContactRow>
              ) : null}
              {business.website ? (
                <ContactRow icon={Globe} href={business.website}>
                  {business.website.replace(/^https?:\/\//, "")}
                </ContactRow>
              ) : null}
              {business.workingHours ? (
                <ContactRow icon={Clock}>{business.workingHours}</ContactRow>
              ) : null}
            </div>
          </>
        ) : null}

        {showSocial ? (
          <>
            <div className="my-6 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
            <SocialLinks business={business} className="justify-center" />
          </>
        ) : null}

        {hasTrustDetails || showTrust ? (
          <>
            <div className="my-6 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
            <div className="space-y-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
              <div className="flex items-start gap-2 text-sm font-medium text-emerald-800">
                <ShieldCheck size={18} className="mt-0.5 flex-shrink-0" />
                <span>{trustStatement}</span>
              </div>
              {business.yearsInBusiness ? (
                <p className="flex items-center gap-2 text-xs text-slate-600">
                  <Clock size={14} className="text-emerald-600" />
                  {business.yearsInBusiness}+ years in business
                </p>
              ) : null}
              {business.foundedYear ? (
                <p className="flex items-center gap-2 text-xs text-slate-600">
                  <Award size={14} className="text-emerald-600" />
                  Founded in {business.foundedYear}
                </p>
              ) : null}
              {business.customersServed ? (
                <p className="flex items-center gap-2 text-xs text-slate-600">
                  <Users size={14} className="text-emerald-600" />
                  {business.customersServed} customers served
                </p>
              ) : null}
              {business.awardsCertifications ? (
                <p className="flex items-start gap-2 text-xs text-slate-600">
                  <Award size={14} className="mt-0.5 flex-shrink-0 text-emerald-600" />
                  {business.awardsCertifications}
                </p>
              ) : null}
            </div>
          </>
        ) : null}
      </div>

      <div className="mt-auto pt-6">
        <div className="rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-white p-4 text-center shadow-inner">
          <p className="text-sm font-medium leading-7 text-slate-700 sm:text-base">{REVIEW_CTA}</p>
        </div>
      </div>
    </div>
  );
}
