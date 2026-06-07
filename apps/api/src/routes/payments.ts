import crypto from "node:crypto";
import Razorpay from "razorpay";
import { Router } from "express";
import { z } from "zod";
import { env } from "../config/env.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { Business } from "../models/Business.js";
import { Subscription } from "../models/Subscription.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
const razorpay =
  env.razorpayKeyId && env.razorpayKeySecret
    ? new Razorpay({ key_id: env.razorpayKeyId, key_secret: env.razorpayKeySecret })
    : null;

const orderSchema = z.object({
  plan: z.string().default("starter"),
  amount: z.number().int().positive()
});

router.post(
  "/order",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const data = orderSchema.parse(req.body);
    const business = await Business.findOne({ ownerId: req.user?.id });

    if (!business) {
      return res.status(400).json({ message: "Create a business profile first" });
    }

    if (!razorpay) {
      return res.json({
        order: { id: `dev_order_${Date.now()}`, amount: data.amount * 100, currency: "INR" },
        keyId: env.razorpayKeyId,
        mode: "mock"
      });
    }

    const order = await razorpay.orders.create({
      amount: data.amount * 100,
      currency: "INR",
      receipt: `btr_${business._id}_${Date.now()}`,
      notes: { businessId: String(business._id), plan: data.plan }
    });

    await Subscription.create({
      businessId: business._id,
      plan: data.plan,
      amount: data.amount,
      startDate: new Date(),
      endDate: addMonths(new Date(), 1),
      razorpayOrderId: order.id,
      status: "created"
    });

    return res.json({ order, keyId: env.razorpayKeyId, mode: "live" });
  })
);

router.post(
  "/verify",
  requireAuth,
  asyncHandler(async (req, res) => {
    const schema = z.object({
      razorpay_order_id: z.string(),
      razorpay_payment_id: z.string(),
      razorpay_signature: z.string()
    });
    const data = schema.parse(req.body);

    if (!env.razorpayKeySecret) {
      return res.json({ verified: true, mode: "mock" });
    }

    const expected = crypto
      .createHmac("sha256", env.razorpayKeySecret)
      .update(`${data.razorpay_order_id}|${data.razorpay_payment_id}`)
      .digest("hex");

    const verified = expected === data.razorpay_signature;
    await Subscription.updateOne({ razorpayOrderId: data.razorpay_order_id }, { status: verified ? "active" : "failed" });

    return res.json({ verified });
  })
);

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

export default router;

