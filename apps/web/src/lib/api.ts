const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export type Business = {
  _id: string;
  businessName: string;
  category: string;
  logo?: string;
  googleReviewLink: string;
  qrCode?: string;
  subscriptionPlan?: string;
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
      { enableHighAccuracy: false, maximumAge: 300000, timeout: 6000 }
    );
  });
}

export function setToken(token: string) {
  window.localStorage.setItem("btr_token", token);
}

export function clearToken() {
  window.localStorage.removeItem("btr_token");
}

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

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || "Request failed");
  }

  return payload as T;
}
