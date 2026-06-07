import QRCode from "qrcode";
import { Router } from "express";
import { z } from "zod";
import { env } from "../config/env.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { Business } from "../models/Business.js";
import { Review } from "../models/Review.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

const profileSchema = z.object({
  businessName: z.string().min(2),
  category: z.string().min(2),
  logo: z.string().optional().default(""),
  googleReviewLink: z.string().url(),
  subscriptionPlan: z.string().optional().default("free")
});

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const business = await Business.findOne({ ownerId: req.user?.id });
    const user = await User.findById(req.user?.id).select("email name picture lastLoginLocation");
    return res.json({ business, user });
  })
);

router.post(
  "/profile",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const data = profileSchema.parse(req.body);
    const existing = await Business.findOne({ ownerId: req.user?.id });

    const business =
      existing ||
      new Business({
        ownerId: req.user?.id,
        businessName: data.businessName,
        category: data.category,
        googleReviewLink: data.googleReviewLink
      });

    business.set(data);
    await business.save();

    const reviewUrl = `${env.clientUrl}/review/${business._id}`;
    business.qrCode = await QRCode.toDataURL(reviewUrl, { margin: 1, width: 720 });
    await business.save();

    return res.json({ business, reviewUrl });
  })
);

router.get(
  "/public/:businessId",
  asyncHandler(async (req, res) => {
    const business = await Business.findById(req.params.businessId).select(
      "businessName category logo googleReviewLink subscriptionPlan"
    );

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    await Business.updateOne({ _id: business._id }, { $inc: { qrScans: 1 } });
    return res.json({ business });
  })
);

router.get(
  "/analytics",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const business = await Business.findOne({ ownerId: req.user?.id });

    if (!business) {
      return res.json({ metrics: null, insights: null });
    }

    const reviews = await Review.find({ businessId: business._id }).sort({ createdAt: -1 }).limit(100);
    const totalReviews = reviews.length;
    const averageRating =
      totalReviews === 0 ? 0 : reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
    const posted = reviews.filter((review) => review.postedToGoogle).length;
    const words = extractWords(reviews.map((review) => review.customerFeedback).join(" "));

    return res.json({
      metrics: {
        qrScans: business.qrScans,
        reviewsGenerated: totalReviews,
        reviewsPosted: posted,
        averageRating: Number(averageRating.toFixed(1))
      },
      insights: {
        mostMentionedWords: words.slice(0, 8),
        summary: summarizeFeedback(reviews.map((review) => review.customerFeedback))
      }
    });
  })
);

function extractWords(text: string) {
  const stopWords = new Set(["the", "and", "for", "with", "very", "this", "that", "was", "were", "hai", "bahut"]);
  const counts = new Map<string, number>();

  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stopWords.has(word))
    .forEach((word) => counts.set(word, (counts.get(word) || 0) + 1));

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([word, count]) => ({ word, count }));
}

function summarizeFeedback(feedback: string[]) {
  if (!feedback.length) {
    return "No customer feedback has been generated yet.";
  }

  return "Customers are mentioning " + feedback.slice(0, 3).join("; ").slice(0, 220) + ".";
}

export default router;
