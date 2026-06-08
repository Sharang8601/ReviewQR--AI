const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export type Business = {
  _id: string;
  businessName: string;
  category: string;
  logo?: string;
  googleReviewLink: string;
  qrCode?: string;
  subscriptionPlan?: string;
  businessDescription?: string;
  tagline?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  googleMapsUrl?: string;
  workingHours?: string;
  foundedYear?: number | null;
  instagramUrl?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  youtubeUrl?: string;
  tiktokUrl?: string;
  whatsappNumber?: string;
  telegramUrl?: string;
  yearsInBusiness?: number | null;
  customersServed?: string;
  awardsCertifications?: string;
  trustStatement?: string;
  showDescription?: boolean;
  showSocialLinks?: boolean;
  showContactInfo?: boolean;
  showTrustInfo?: boolean;
};

export type Review = {
  _id: string;
  rating: number;
  customerFeedback: string;
  aiGeneratedReview: string;
  createdAt: string;
};

export type LoginLocation = {
  latitude: number;
  longitude: number;
  accuracy?: number;
  capturedAt?: string;
  city?: string;
  locality?: string;
  state?: string;
};

export type CurrentUser = {
  id?: string;
  email: string;
  name?: string;
  picture?: string;
  lastLoginLocation?: LoginLocation;
};

export function getToken() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem("btr_token") || "";
}

export async function getBrowserLocation() {
  if (typeof window === "undefined" || !navigator.geolocation) {
    return null;
  }

  return new Promise<LoginLocation | null>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        }),
      () => resolve(null),
      { enableHighAccuracy: false, maximumAge: 300000, timeout: 10000 }
    );
  });
}

export async function syncUserLocation() {
  const coords = await getBrowserLocation();
  if (!coords) return null;

  try {
    const result = await apiFetch<{ location: LoginLocation }>("/api/auth/location", {
      method: "PATCH",
      body: JSON.stringify(coords)
    });
    return result.location;
  } catch {
    return null;
  }
}

export function setToken(token: string) {
  window.localStorage.setItem("btr_token", token);
}

export function clearToken() {
  window.localStorage.removeItem("btr_token");
}

type ApiPayload = {
  success?: boolean;
  message?: string;
};

export async function apiFetch<T>(path: string, init: RequestInit = {}) {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers
    }
  });

  const payload = (await response.json().catch(() => ({}))) as T & ApiPayload;

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Request failed");
  }

  return payload as T;
}
