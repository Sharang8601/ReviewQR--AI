import type { Metadata } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

type BusinessPublic = {
  businessName: string;
  category: string;
  logo?: string;
  tagline?: string;
  businessDescription?: string;
};

async function getBusiness(businessId: string): Promise<BusinessPublic | null> {
  try {
    const response = await fetch(`${API_URL}/api/business/public/${businessId}`, {
      next: { revalidate: 300 }
    });

    if (!response.ok) return null;

    const data = (await response.json()) as { business: BusinessPublic };
    return data.business;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ businessId: string }>;
}): Promise<Metadata> {
  const { businessId } = await params;
  const business = await getBusiness(businessId);

  const title = business
    ? `Leave a review for ${business.businessName} | ReviewQR AI`
    : "Share Your Review | ReviewQR AI";

  const description = business?.businessDescription?.trim()
    ? business.businessDescription.trim().slice(0, 160)
    : business
      ? `Rate ${business.businessName}${business.tagline ? ` — ${business.tagline}` : ""} and get an AI-polished Google review in seconds.`
      : "Share your experience and get an AI-polished Google review in seconds with ReviewQR AI.";

  const ogImage = business?.logo && business.logo.startsWith("http")
    ? business.logo
    : `${SITE_URL}/og-default.svg`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "ReviewQR AI",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: business ? `${business.businessName} on ReviewQR AI` : "ReviewQR AI"
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage]
    }
  };
}

export default function ReviewLayout({ children }: { children: React.ReactNode }) {
  return children;
}
