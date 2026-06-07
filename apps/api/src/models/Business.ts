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
    qrScans: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export type BusinessDocument = InferSchemaType<typeof businessSchema> & { _id: string };
export const Business = model("Business", businessSchema);

