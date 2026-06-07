import bcrypt from "bcryptjs";
import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const locationSchema = z
  .object({
    latitude: z.number(),
    longitude: z.number(),
    accuracy: z.number().optional()
  })
  .optional();

const googleSchema = z.object({
  credential: z.string().min(1),
  location: locationSchema
});

const googleClient = env.googleClientId ? new OAuth2Client(env.googleClientId) : null;

function signToken(user: { _id: unknown; email: string }) {
  return jwt.sign({ id: String(user._id), email: user.email }, env.jwtSecret, { expiresIn: "30d" });
}

router.get("/config", (_req, res) => {
  return res.json({ googleClientId: env.googleClientId });
});

router.post(
  "/signup",
  asyncHandler(async (req, res) => {
    const data = authSchema.parse(req.body);
    const existing = await User.findOne({ email: data.email });

    if (existing) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await User.create({ email: data.email, passwordHash });

    return res.status(201).json({
      token: signToken(user),
      user: { id: user._id, email: user.email }
    });
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const data = authSchema.parse(req.body);
    const user = await User.findOne({ email: data.email });

    if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    return res.json({
      token: signToken(user),
      user: { id: user._id, email: user.email }
    });
  })
);

router.post(
  "/google",
  asyncHandler(async (req, res) => {
    if (!googleClient || !env.googleClientId) {
      return res.status(503).json({ message: "Google login is not configured" });
    }

    const data = googleSchema.parse(req.body);
    const ticket = await googleClient.verifyIdToken({
      idToken: data.credential,
      audience: env.googleClientId
    });
    const payload = ticket.getPayload();

    if (!payload?.email || !payload.sub) {
      return res.status(401).json({ message: "Google account could not be verified" });
    }

    const location = data.location
      ? {
          ...data.location,
          capturedAt: new Date()
        }
      : undefined;

    const user = await User.findOneAndUpdate(
      { email: payload.email.toLowerCase() },
      {
        $set: {
          email: payload.email.toLowerCase(),
          googleId: payload.sub,
          name: payload.name || "",
          picture: payload.picture || "",
          ...(location ? { lastLoginLocation: location } : {})
        },
        $setOnInsert: { passwordHash: "" }
      },
      { new: true, upsert: true }
    );

    return res.json({
      token: signToken(user),
      user: { id: user._id, email: user.email, name: user.name, picture: user.picture }
    });
  })
);

router.patch(
  "/location",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const location = locationSchema.parse(req.body);

    if (!location) {
      return res.status(400).json({ message: "Location is required" });
    }

    // Try to reverse geocode the location
    let geocoded: { city?: string; locality?: string; state?: string } = {};
    try {
      const geoResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.latitude}&lon=${location.longitude}`,
        {
          headers: { "Accept": "application/json" }
        }
      );

      if (geoResponse.ok) {
        const geoData = await geoResponse.json();
        const address = geoData.address || {};
        geocoded = {
          city: address.city || address.town || address.village || address.county,
          locality: address.suburb || address.neighbourhood,
          state: address.state || address.province
        };
      }
    } catch (error) {
      // Silently fail geocoding, location coordinates will still be stored
      console.error("Geocoding error:", error);
    }

    const user = await User.findByIdAndUpdate(
      req.user?.id,
      {
        lastLoginLocation: {
          ...location,
          ...geocoded,
          capturedAt: new Date()
        }
      },
      { new: true }
    ).select("lastLoginLocation");

    return res.json({ location: user?.lastLoginLocation });
  })
);

export default router;
