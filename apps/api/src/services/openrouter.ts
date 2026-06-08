import OpenAI from "openai";

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

const apiKey = process.env.OPENROUTER_API_KEY;

const client = apiKey
  ? new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey,
    })
  : null;

export async function generateProfessionalReview(
  input: ReviewInput
): Promise<GenerateReviewResult> {
  if (!client) {
    return {
      success: false,
      message: "OpenRouter API key missing",
    };
  }

  const MODELS = [
    "google/gemma-4-26b-a4b-it:free",
    "qwen/qwen3-30b-a3b:free",
    "meta-llama/llama-3.1-8b-instruct:free",
    "mistralai/mistral-7b-instruct:free",
  ];

  for (const model of MODELS) {
    try {
      console.log(`Trying model: ${model}`);

      const completion = await client.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: `
You are a professional Google Review writer.

Rules:
- Generate EXACTLY ONE Google review.
- Return ONLY the review text.
- No explanations.
- No multiple options.
- No headings.
- Do not mention that feedback is brief.
- Length 30-100 words.
- Match the rating.
- Sound natural and human.
            `,
          },
          {
            role: "user",
            content: `
Business: ${input.businessName}
Category: ${input.category}
Rating: ${input.rating}
Language: ${input.language || "English"}

Customer Feedback:
${input.feedback}
            `,
          },
        ],
      });

      const review =
        completion.choices?.[0]?.message?.content?.trim();

      if (review) {
        console.log(`Success using ${model}`);

        return {
          success: true,
          review,
        };
      }
    } catch (err: any) {
      console.log(
        `Model ${model} failed:`,
        err?.error?.message || err?.message
      );
    }
  }

  return {
    success: false,
    message: "All AI providers failed",
  };
}