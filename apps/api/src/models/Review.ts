import { Schema, model, Types, type InferSchemaType } from "mongoose";

const reviewSchema = new Schema(
  {
    businessId: { type: Types.ObjectId, ref: "Business", required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    customerFeedback: { type: String, required: true, trim: true },
    aiGeneratedReview: { type: String, required: true, trim: true },
    language: { type: String, default: "English" },
    postedToGoogle: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export type ReviewDocument = InferSchemaType<typeof reviewSchema> & { _id: string };
export const Review = model("Review", reviewSchema);

