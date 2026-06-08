import { Router } from "express";
import { z } from "zod";
import { Business } from "../models/Business.js";
import { Review } from "../models/Review.js";
import { generateReviews } from "../services/ai.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

const generateSchema = z.object({
  businessId: z.string().min(1),
  rating: z.number().min(1).max(5),
  customerFeedback: z.string().min(3).max(1000),
  tone: z.string().min(1).max(50).default("Friendly"),
  language: z.string().optional().default("English")
});

router.post(
  "/generate",
  asyncHandler(async (req, res) => {
    const data = generateSchema.parse(req.body);
    const business = await Business.findById(data.businessId);

    if (!business) {
      return res.status(404).json({ success: false, message: "Business not found" });
    }

    const aiResult = await generateReviews({
      businessName: business.businessName,
      category: business.category,
      rating: data.rating,
      feedback: data.customerFeedback,
      tone: data.tone,
      language: data.language
    });

    if (!aiResult.success) {
      return res.status(503).json({
        success: false,
        message: aiResult.message || "AI is currently busy. Please try again in a few seconds.",
      });
    }

    // Save the first review to DB for tracking, store all in response
    const review = await Review.create({
      businessId: business._id,
      rating: data.rating,
      customerFeedback: data.customerFeedback,
      aiGeneratedReview: aiResult.reviews[0],
      language: data.language
    });

    return res.status(201).json({
      success: true,
      review,
      reviewOptions: aiResult.reviews,
      googleReviewLink: business.googleReviewLink
    });
  })
);

router.patch(
  "/:reviewId/posted",
  asyncHandler(async (req, res) => {
    const review = await Review.findByIdAndUpdate(req.params.reviewId, { postedToGoogle: true }, { new: true });

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    return res.json({ success: true, review });
  })
);

export default router;