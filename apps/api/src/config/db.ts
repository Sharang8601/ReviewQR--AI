import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDb() {
  mongoose.set("strictQuery", true);
   console.log("Connecting to:", env.mongoUri);
  await mongoose.connect(env.mongoUri);
  console.log("MongoDB connected");
}

