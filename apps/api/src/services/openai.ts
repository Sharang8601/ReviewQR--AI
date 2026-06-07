import OpenAI from "openai";
import { env } from "../config/env.js";

type ReviewInput = {
  businessName: string;
  category: string;
  rating: number;
  feedback: string;
  language?: string;
};

const client = env.openAiApiKey ? new OpenAI({ apiKey: env.openAiApiKey }) : null;

export async function generateProfessionalReview(input: ReviewInput) {
  if (!client) {
    return fallbackReview(input);
  }

  const language = input.language || "English";
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

  return response.choices[0]?.message?.content?.trim() || fallbackReview(input);
}

function fallbackReview(input: ReviewInput) {
  const sentiment = input.rating >= 4 ? "had a great experience" : "appreciated the service";
  return `I ${sentiment} at ${input.businessName}. ${input.feedback.trim()} I would recommend them to anyone looking for a reliable ${input.category.toLowerCase()} option.`;
}

