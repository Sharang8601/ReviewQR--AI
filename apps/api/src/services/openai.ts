import OpenAI from "openai";
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

const client = env.openAiApiKey ? new OpenAI({ apiKey: env.openAiApiKey }) : null;

export async function generateProfessionalReview(input: ReviewInput): Promise<GenerateReviewResult> {
  if (!client || !env.openAiApiKey) {
    console.error("OpenAI Error", "OpenAI API key missing");
    return { success: false, message: "OpenAI API key missing" };
  }

  const language = input.language || "English";

  console.log("OpenAI Request", {
    businessName: input.businessName,
    category: input.category,
    rating: input.rating,
    language
  });

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Write honest, natural Google review text. Keep it concise, specific, professional, and never invent details beyond the customer feedback."
        },
        {
          role: "user",
          content: [
            `Business: ${input.businessName}`,
            `Category: ${input.category}`,
            `Rating: ${input.rating}/5`,
            `Customer feedback: ${input.feedback}`,
            `Output language: ${language}`,
            "Return only the review text."
          ].join("\n")
        }
      ],
      temperature: 0.7,
      max_tokens: 160
    });

    const review = response.choices[0]?.message?.content?.trim();
    console.log("OpenAI Response", review);

    if (!review) {
      console.error("OpenAI Error", "Empty response from OpenAI");
      return { success: false, message: "Unable to generate AI suggestion" };
    }

    return { success: true, review };
  } catch (error) {
    console.error("OpenAI Error", error);
    return { success: false, message: "Unable to generate AI suggestion" };
  }
}
