export type GeocodeLocation = {
  city?: string;
  locality?: string;
  state?: string;
};

export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<GeocodeLocation | null> {
  try {
    // Using Open Street Map's Nominatim service (free, no API key required)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "BoostTheReviews/1.0 (reviewqr-ai)"
        }
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const address = data.address || {};

    return {
      city: address.city || address.town || address.village || address.county || address.state_district,
      locality: address.suburb || address.neighbourhood || address.quarter,
      state: address.state || address.province || address.region
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

export function formatLocation(location: GeocodeLocation): string {
  const parts = [];
  
  if (location.locality) {
    parts.push(location.locality);
  }
  
  if (location.city) {
    parts.push(location.city);
  }
  
  if (location.state) {
    parts.push(location.state);
  }

  return parts.join(", ");
}
