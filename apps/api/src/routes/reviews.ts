import { Router } from "express";
import { z } from "zod";
import { Business } from "../models/Business.js";
import { Review } from "../models/Review.js";
import { generateProfessionalReview } from "../services/openai.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

const generateSchema = z.object({
  businessId: z.string().min(1),
  rating: z.number().min(1).max(5),
  customerFeedback: z.string().min(3).max(1000),
  language: z.string().optional().default("English")
});

router.post(
  "/generate",
  asyncHandler(async (req, res) => {
    const data = generateSchema.parse(req.body);
    const business = await Business.findById(data.businessId);

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    const aiGeneratedReview = await generateProfessionalReview({
      businessName: business.businessName,
      category: business.category,
      rating: data.rating,
      feedback: data.customerFeedback,
      language: data.language
    });

    const review = await Review.create({
      businessId: business._id,
      rating: data.rating,
      customerFeedback: data.customerFeedback,
      aiGeneratedReview,
      language: data.language
    });

    return res.status(201).json({ review, googleReviewLink: business.googleReviewLink });
  })
);

router.patch(
  "/:reviewId/posted",
  asyncHandler(async (req, res) => {
    const review = await Review.findByIdAndUpdate(req.params.reviewId, { postedToGoogle: true }, { new: true });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    return res.json({ review });
  })
);

export default router;

