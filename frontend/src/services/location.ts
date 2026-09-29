import { fetchLiveWeather, RealtimeWeather } from './weather';

/**
 * Location Detection & Agro-Climatic Station Mapping Service
 * Integrates browser GPS Geolocation API with Haversine nearest-neighbor
 * distance calculation against regional agro-climatic baseline profiles.
 */

export interface DistrictCoord {
  district: string;
  state: string;
  lat: number;
  lon: number;
}

export const DISTRICT_COORDINATES: DistrictCoord[] = [
  { district: 'Ludhiana', state: 'Punjab', lat: 30.9010, lon: 75.8573 },
  { district: 'Karnal', state: 'Haryana', lat: 29.6857, lon: 76.9905 },
  { district: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lon: 82.9739 },
  { district: 'Patna', state: 'Bihar', lat: 25.5941, lon: 85.1376 },
  { district: 'Burdwan', state: 'West Bengal', lat: 23.2324, lon: 87.8615 },
  { district: 'Mandya', state: 'Karnataka', lat: 12.5218, lon: 76.8951 },
  { district: 'Thanjavur', state: 'Tamil Nadu', lat: 10.7870, lon: 79.1378 },
  { district: 'Guntur', state: 'Andhra Pradesh', lat: 16.3067, lon: 80.4365 },
  { district: 'Rajkot', state: 'Gujarat', lat: 22.3039, lon: 70.8022 },
  { district: 'Nashik', state: 'Maharashtra', lat: 19.9975, lon: 73.7898 },
  { district: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lon: 75.8577 },
  { district: 'Kota', state: 'Rajasthan', lat: 25.2138, lon: 75.8648 },
];

/**
 * Calculates Haversine great-circle distance between two GPS coordinates in kilometers.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Finds the nearest supported agro-climatic district for given coordinates.
 */
export function findNearestDistrict(
  lat: number,
  lon: number,
  availableDistricts?: string[]
): { district: string; state: string; distanceKm: number } {
  const pool = availableDistricts && availableDistricts.length > 0
    ? DISTRICT_COORDINATES.filter(d => availableDistricts.includes(d.district))
    : DISTRICT_COORDINATES;

  const validPool = pool.length > 0 ? pool : DISTRICT_COORDINATES;

  let nearest = validPool[0];
  let minDistance = Infinity;

  for (const item of validPool) {
    const dist = calculateHaversineDistance(lat, lon, item.lat, item.lon);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = item;
    }
  }

  return {
    district: nearest.district,
    state: nearest.state,
    distanceKm: minDistance
  };
}

/**
 * Tries reverse-geocoding via OpenStreetMap Nominatim with a fast timeout.
 */
export async function reverseGeocode(
  lat: number,
  lon: number
): Promise<{ locality?: string; district?: string; state?: string } | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`,
      {
        signal: controller.signal,
        headers: { 'Accept-Language': 'en' }
      }
    );
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    const data = await res.json();
    const address = data.address || {};
    return {
      locality: address.city || address.town || address.village || address.suburb || address.county,
      district: address.state_district || address.county,
      state: address.state
    };
  } catch {
    return null;
  }
}

export interface DetectedLocationResult {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  matchedDistrict: string;
  matchedState: string;
  distanceKm: number;
  locality?: string;
  isExactDistrictMatch: boolean;
  message: string;
  weather?: RealtimeWeather;
}

/**
 * Requests the browser geolocation and resolves the nearest agro-climatic zone.
 */
export async function detectUserLocation(
  availableDistricts?: string[]
): Promise<DetectedLocationResult> {
  if (!navigator.geolocation) {
    throw new Error('Geolocation is not supported by your browser.');
  }

  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    });
  });

  const { latitude, longitude, accuracy } = position.coords;

  // Concurrently reverse geocode and fetch real-time weather for the detected coordinates
  const [geoInfo, weather] = await Promise.all([
    reverseGeocode(latitude, longitude),
    fetchLiveWeather(latitude, longitude).catch(err => {
      console.warn('Live weather service fetch warning:', err);
      return undefined;
    })
  ]);

  let exactMatch: DistrictCoord | undefined;
  if (geoInfo?.district || geoInfo?.locality) {
    const targetName = (geoInfo.district || geoInfo.locality || '').toLowerCase();
    exactMatch = DISTRICT_COORDINATES.find(
      d => targetName.includes(d.district.toLowerCase()) || d.district.toLowerCase().includes(targetName)
    );
  }

  if (exactMatch) {
    const dist = calculateHaversineDistance(latitude, longitude, exactMatch.lat, exactMatch.lon);
    return {
      latitude: Number(latitude.toFixed(4)),
      longitude: Number(longitude.toFixed(4)),
      accuracyMeters: Math.round(accuracy),
      matchedDistrict: exactMatch.district,
      matchedState: exactMatch.state,
      distanceKm: dist,
      locality: geoInfo?.locality || exactMatch.district,
      isExactDistrictMatch: true,
      message: `Directly detected in ${exactMatch.district}, ${exactMatch.state}`,
      weather
    };
  }

  // Calculate nearest supported district using Haversine formula
  const nearest = findNearestDistrict(latitude, longitude, availableDistricts);

  return {
    latitude: Number(latitude.toFixed(4)),
    longitude: Number(longitude.toFixed(4)),
    accuracyMeters: Math.round(accuracy),
    matchedDistrict: nearest.district,
    matchedState: nearest.state,
    distanceKm: nearest.distanceKm,
    locality: geoInfo?.locality,
    isExactDistrictMatch: nearest.distanceKm < 45,
    message: geoInfo?.locality
      ? `Located near ${geoInfo.locality} • Paired with ${nearest.district}, ${nearest.state} agro-climatic zone (${nearest.distanceKm} km)`
      : `GPS detected (${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E) • Paired with ${nearest.district}, ${nearest.state} (${nearest.distanceKm} km)`,
    weather
  };
}
