import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/boost-the-reviews",
  jwtSecret: process.env.JWT_SECRET || "dev-only-secret",
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  googleClientId: process.env.GOOGLE_CLIENT_ID || "858078690072-t69cu1uu7qrneghl4916g32srufkk53c.apps.googleusercontent.com",
  openAiApiKey: process.env.OPENAI_API_KEY || "",
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || "",
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || ""
};
