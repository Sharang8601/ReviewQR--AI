import { Schema, model, Types, type InferSchemaType } from "mongoose";

const businessSchema = new Schema(
  {
    ownerId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    businessName: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    logo: { type: String, default: "" },
    googleReviewLink: { type: String, required: true, trim: true },
    qrCode: { type: String, default: "" },
    subscriptionPlan: { type: String, default: "free" },
    qrScans: { type: Number, default: 0 },

    businessDescription: { type: String, default: "", trim: true },
    tagline: { type: String, default: "", trim: true },
    address: { type: String, default: "", trim: true },
    phone: { type: String, default: "", trim: true },
    email: { type: String, default: "", trim: true },
    website: { type: String, default: "", trim: true },
    googleMapsUrl: { type: String, default: "", trim: true },
    workingHours: { type: String, default: "", trim: true },
    foundedYear: { type: Number, default: null },

    instagramUrl: { type: String, default: "", trim: true },
    facebookUrl: { type: String, default: "", trim: true },
    twitterUrl: { type: String, default: "", trim: true },
    linkedinUrl: { type: String, default: "", trim: true },
    youtubeUrl: { type: String, default: "", trim: true },
    tiktokUrl: { type: String, default: "", trim: true },
    whatsappNumber: { type: String, default: "", trim: true },
    telegramUrl: { type: String, default: "", trim: true },

    yearsInBusiness: { type: Number, default: null },
    customersServed: { type: String, default: "", trim: true },
    awardsCertifications: { type: String, default: "", trim: true },
    trustStatement: { type: String, default: "", trim: true },

    showDescription: { type: Boolean, default: true },
    showSocialLinks: { type: Boolean, default: true },
    showContactInfo: { type: Boolean, default: true },
    showTrustInfo: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export type BusinessDocument = InferSchemaType<typeof businessSchema> & { _id: string };
export const Business = model("Business", businessSchema);
