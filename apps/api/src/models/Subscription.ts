import { Schema, model, Types, type InferSchemaType } from "mongoose";

const subscriptionSchema = new Schema(
  {
    businessId: { type: Types.ObjectId, ref: "Business", required: true, index: true },
    plan: { type: String, required: true },
    amount: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    razorpayOrderId: { type: String, default: "" },
    status: { type: String, default: "created" }
  },
  { timestamps: true }
);

export type SubscriptionDocument = InferSchemaType<typeof subscriptionSchema> & { _id: string };
export const Subscription = model("Subscription", subscriptionSchema);

