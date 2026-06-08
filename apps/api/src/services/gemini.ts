import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";

type ReviewInput = {
  businessName: string;
  category: string;
  rating: number;
  feedback: string;
  language?: string;
};

export type GenerateReviewResult =
  | { success: true; review: string }
  | { success: false; message: string };

const client = env.geminiApiKey ? new GoogleGenerativeAI(env.geminiApiKey) : null;

export async function generateProfessionalReview(input: ReviewInput): Promise<GenerateReviewResult> {
  if (!client || !env.geminiApiKey) {
    console.error("Gemini Error", "Gemini API key missing");
    return { success: false, message: "Gemini API key missing" };
  }

  const language = input.language || "English";

  console.log("Gemini Request", {
    businessName: input.businessName,
    category: input.category,
    rating: input.rating,
    language
  });

  try {
    const model = client.getGenerativeModel({
      model: env.geminiModel,
      systemInstruction:
        "Write honest, natural Google review text. Keep it concise, specific, professional, and never invent details beyond the customer feedback. Return only the review text with no quotes or labels."
    });

    const prompt = [
      `Business: ${input.businessName}`,
      `Category: ${input.category}`,
      `Rating: ${input.rating}/5`,
      `Customer feedback: ${input.feedback}`,
      `Output language: ${language}`,
      "Return only the review text."
    ].join("\n");

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 200
      }
    });

    const review = result.response.text()?.trim();
    console.log("Gemini Response", review);

    if (!review) {
      console.error("Gemini Error", "Empty response from Gemini");
      return { success: false, message: "Unable to generate AI suggestion" };
    }

    return { success: true, review };
  } catch (error) {
    console.error("Gemini Error", error);
    return { success: false, message: "Unable to generate AI suggestion" };
  }
}
