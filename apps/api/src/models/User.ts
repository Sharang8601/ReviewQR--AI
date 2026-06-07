import { Schema, model, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, default: "" },
    googleId: { type: String, default: "", index: true },
    name: { type: String, default: "" },
    picture: { type: String, default: "" },
    lastLoginLocation: {
      latitude: { type: Number },
      longitude: { type: Number },
      accuracy: { type: Number },
      capturedAt: { type: Date },
      city: { type: String, default: "" },
      locality: { type: String, default: "" },
      state: { type: String, default: "" }
    }
  },
  { timestamps: true }
);

export type UserDocument = InferSchemaType<typeof userSchema> & { _id: string };
export const User = model("User", userSchema);
