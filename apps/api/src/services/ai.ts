import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

type ReviewInput = {
  businessName: string;
  category: string;
  rating: number;
  feedback: string;
  tone: string;
  language?: string;
};

export type GenerateReviewResult =
  | { success: true; reviews: string[] }
  | { success: false; message: string };

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const geminiClient = GEMINI_API_KEY
  ? new GoogleGenerativeAI(GEMINI_API_KEY)
  : null;

const openrouterClient = OPENROUTER_API_KEY
  ? new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: OPENROUTER_API_KEY,
    })
  : null;

function buildSystemPrompt(tone: string): string {
  return `You are a professional Google Review writer.

Rules:
- Generate EXACTLY 4 different review variations.
- Return ONLY the 4 reviews, one per line.
- No explanations.
- No headings.
- No "Option 1", "Option 2", etc.
- Sound human.
- Match the rating.
- Length 30-100 words each.
- Tone must be: ${tone}.
- Use plain text only. No markdown formatting.
- Each review must be on its own separate line.
- Do not number or label the reviews.`;
}

function buildUserPrompt(input: ReviewInput): string {
  return `
Business: ${input.businessName}
Category: ${input.category}
Rating: ${input.rating}
Tone: ${input.tone}
Language: ${input.language || "English"}

Customer Feedback:
${input.feedback}

Generate 4 different review variations in ${input.tone} tone. Return each review on its own line with no numbering or labels.`;
}

function parseReviews(text: string): string[] {
  // Split by newlines, filter empty lines, trim each
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 10);

  return lines.slice(0, 4);
}

async function generateWithGemini(input: ReviewInput): Promise<string | null> {
  if (!geminiClient) return null;

  try {
    const model = geminiClient.getGenerativeModel({ model: GEMINI_MODEL });
    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: buildSystemPrompt(input.tone) }] },
        { role: "user", parts: [{ text: buildUserPrompt(input) }] },
      ],
    });

    const text = result.response.text().trim();
    if (text) {
      console.log("Gemini API success");
      return text;
    }
    return null;
  } catch (err: any) {
    console.log("Gemini API failed:", err?.message || err);
    return null;
  }
}

async function generateWithOpenRouter(input: ReviewInput): Promise<string | null> {
  if (!openrouterClient) return null;

  const MODELS = [
    "google/gemma-4-26b-a4b-it:free",
    "qwen/qwen3-30b-a3b:free",
    "meta-llama/llama-3.1-8b-instruct:free",
    "mistralai/mistral-7b-instruct:free",
  ];

  for (const model of MODELS) {
    try {
      console.log(`Trying OpenRouter model: ${model}`);

      const completion = await openrouterClient.chat.completions.create({
        model,
        messages: [
          { role: "system", content: buildSystemPrompt(input.tone) },
          { role: "user", content: buildUserPrompt(input) },
        ],
      });

      const content = completion.choices?.[0]?.message?.content?.trim();

      if (content) {
        console.log(`OpenRouter success using ${model}`);
        return content;
      }
    } catch (err: any) {
      console.log(`OpenRouter model ${model} failed:`, err?.error?.message || err?.message);
    }
  }

  return null;
}

export async function generateReviews(input: ReviewInput): Promise<GenerateReviewResult> {
  // Try Gemini first
  const geminiText = await generateWithGemini(input);
  if (geminiText) {
    const reviews = parseReviews(geminiText);
    if (reviews.length >= 2) {
      return { success: true, reviews };
    }
  }

  // Fallback to OpenRouter
  const openrouterText = await generateWithOpenRouter(input);
  if (openrouterText) {
    const reviews = parseReviews(openrouterText);
    if (reviews.length >= 2) {
      return { success: true, reviews };
    }
  }

  // If we have at least 1 review from any source, return it padded
  const combined = [geminiText, openrouterText].filter(Boolean);
  for (const text of combined) {
    const reviews = parseReviews(text!);
    if (reviews.length >= 1) {
      return { success: true, reviews };
    }
  }

  return {
    success: false,
    message: "AI is currently busy. Please try again in a few seconds.",
  };
}