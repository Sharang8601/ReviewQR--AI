import type { Business } from "./api";

export type BusinessProfileForm = {
  businessName: string;
  category: string;
  logo: string;
  googleReviewLink: string;
  subscriptionPlan: string;
  businessDescription: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  googleMapsUrl: string;
  workingHours: string;
  foundedYear: string;
  instagramUrl: string;
  facebookUrl: string;
  twitterUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
  tiktokUrl: string;
  whatsappNumber: string;
  telegramUrl: string;
  yearsInBusiness: string;
  customersServed: string;
  awardsCertifications: string;
  trustStatement: string;
  showDescription: boolean;
  showSocialLinks: boolean;
  showContactInfo: boolean;
  showTrustInfo: boolean;
};

export const defaultBusinessProfileForm: BusinessProfileForm = {
  businessName: "",
  category: "Restaurant",
  logo: "",
  googleReviewLink: "",
  subscriptionPlan: "free",
  businessDescription: "",
  tagline: "",
  address: "",
  phone: "",
  email: "",
  website: "",
  googleMapsUrl: "",
  workingHours: "",
  foundedYear: "",
  instagramUrl: "",
  facebookUrl: "",
  twitterUrl: "",
  linkedinUrl: "",
  youtubeUrl: "",
  tiktokUrl: "",
  whatsappNumber: "",
  telegramUrl: "",
  yearsInBusiness: "",
  customersServed: "",
  awardsCertifications: "",
  trustStatement: "",
  showDescription: true,
  showSocialLinks: true,
  showContactInfo: true,
  showTrustInfo: true
};

export function businessToForm(business: Business): BusinessProfileForm {
  return {
    businessName: business.businessName,
    category: business.category,
    logo: business.logo || "",
    googleReviewLink: business.googleReviewLink,
    subscriptionPlan: business.subscriptionPlan || "free",
    businessDescription: business.businessDescription || "",
    tagline: business.tagline || "",
    address: business.address || "",
    phone: business.phone || "",
    email: business.email || "",
    website: business.website || "",
    googleMapsUrl: business.googleMapsUrl || "",
    workingHours: business.workingHours || "",
    foundedYear: business.foundedYear ? String(business.foundedYear) : "",
    instagramUrl: business.instagramUrl || "",
    facebookUrl: business.facebookUrl || "",
    twitterUrl: business.twitterUrl || "",
    linkedinUrl: business.linkedinUrl || "",
    youtubeUrl: business.youtubeUrl || "",
    tiktokUrl: business.tiktokUrl || "",
    whatsappNumber: business.whatsappNumber || "",
    telegramUrl: business.telegramUrl || "",
    yearsInBusiness: business.yearsInBusiness ? String(business.yearsInBusiness) : "",
    customersServed: business.customersServed || "",
    awardsCertifications: business.awardsCertifications || "",
    trustStatement: business.trustStatement || "",
    showDescription: business.showDescription ?? true,
    showSocialLinks: business.showSocialLinks ?? true,
    showContactInfo: business.showContactInfo ?? true,
    showTrustInfo: business.showTrustInfo ?? true
  };
}

export function formToBusinessPayload(form: BusinessProfileForm) {
  return {
    ...form,
    foundedYear: form.foundedYear ? Number(form.foundedYear) : null,
    yearsInBusiness: form.yearsInBusiness ? Number(form.yearsInBusiness) : null
  };
}
