import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .refine((value) => value === "" || z.string().url().safeParse(value).success, {
    message: "Must be a valid URL"
  })
  .optional()
  .default("");

const optionalEmail = z
  .string()
  .trim()
  .refine((value) => value === "" || z.string().email().safeParse(value).success, {
    message: "Must be a valid email"
  })
  .optional()
  .default("");

const optionalPhone = z.string().trim().max(30).optional().default("");

const optionalText = z.string().trim().max(2000).optional().default("");

export const businessProfileSchema = z.object({
  businessName: z.string().min(2).max(120),
  category: z.string().min(2).max(80),
  logo: z.string().optional().default(""),
  googleReviewLink: z.string().url(),
  subscriptionPlan: z.string().optional().default("free"),

  businessDescription: optionalText,
  tagline: z.string().trim().max(200).optional().default(""),
  address: z.string().trim().max(300).optional().default(""),
  phone: optionalPhone,
  email: optionalEmail,
  website: optionalUrl,
  googleMapsUrl: optionalUrl,
  workingHours: z.string().trim().max(300).optional().default(""),
  foundedYear: z
    .union([z.number().int().min(1800).max(new Date().getFullYear()), z.null()])
    .optional()
    .default(null),

  instagramUrl: optionalUrl,
  facebookUrl: optionalUrl,
  twitterUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  youtubeUrl: optionalUrl,
  tiktokUrl: optionalUrl,
  whatsappNumber: optionalPhone,
  telegramUrl: optionalUrl,

  yearsInBusiness: z.union([z.number().int().min(0).max(200), z.null()]).optional().default(null),
  customersServed: z.string().trim().max(100).optional().default(""),
  awardsCertifications: optionalText,
  trustStatement: z.string().trim().max(300).optional().default(""),

  showDescription: z.boolean().optional().default(true),
  showSocialLinks: z.boolean().optional().default(true),
  showContactInfo: z.boolean().optional().default(true),
  showTrustInfo: z.boolean().optional().default(true)
});

export type BusinessProfileInput = z.infer<typeof businessProfileSchema>;

export const publicBusinessFields =
  "businessName category logo googleReviewLink subscriptionPlan businessDescription tagline address phone email website googleMapsUrl workingHours foundedYear instagramUrl facebookUrl twitterUrl linkedinUrl youtubeUrl tiktokUrl whatsappNumber telegramUrl yearsInBusiness customersServed awardsCertifications trustStatement showDescription showSocialLinks showContactInfo showTrustInfo";
