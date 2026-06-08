export type GeocodedAddress = {
  city?: string;
  locality?: string;
  state?: string;
};

export async function reverseGeocode(latitude: number, longitude: number): Promise<GeocodedAddress> {
  try {
    const geoResponse = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "BoostTheReviews/1.0 (reviewqr-ai)"
        }
      }
    );

    if (!geoResponse.ok) {
      return {};
    }

    const geoData = await geoResponse.json();
    const address = geoData.address || {};

    return {
      city: address.city || address.town || address.village || address.county || address.state_district,
      locality: address.suburb || address.neighbourhood || address.quarter,
      state: address.state || address.province || address.region
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    return {};
  }
}
