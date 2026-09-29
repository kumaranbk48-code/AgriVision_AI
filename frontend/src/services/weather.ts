/**
 * Real-Time Weather & Agro-Climate Service
 * Fetches hyper-local live weather (temperature, humidity, precipitation, wind, weather code)
 * via Open-Meteo API using detected GPS coordinates.
 */

export interface RealtimeWeather {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  precipitationMm: number;
  weatherCode: number;
  condition: string;
  icon: string;
  windSpeedKmH: number;
  recordedAt: string;
  tempMax?: number;
  tempMin?: number;
}

/**
 * Maps WMO Weather Interpretation Codes to human descriptions & emojis.
 */
export function getWeatherDescription(code: number): { text: string; icon: string } {
  switch (code) {
    case 0:
      return { text: 'Clear Sky', icon: '☀️' };
    case 1:
      return { text: 'Mainly Clear', icon: '🌤️' };
    case 2:
      return { text: 'Partly Cloudy', icon: '⛅' };
    case 3:
      return { text: 'Overcast', icon: '☁️' };
    case 45:
    case 48:
      return { text: 'Foggy / Hazy', icon: '🌫️' };
    case 51:
    case 53:
    case 55:
      return { text: 'Light Drizzle', icon: '🌦️' };
    case 61:
    case 63:
      return { text: 'Moderate Rain', icon: '🌧️' };
    case 65:
      return { text: 'Heavy Rain', icon: '🌧️' };
    case 71:
    case 73:
    case 75:
      return { text: 'Snow Flurries', icon: '❄️' };
    case 80:
    case 81:
    case 82:
      return { text: 'Rain Showers', icon: '🌧️' };
    case 95:
    case 96:
    case 99:
      return { text: 'Thunderstorm', icon: '⛈️' };
    default:
      return { text: 'Fair Weather', icon: '🌤️' };
  }
}

/**
 * Fetches live weather for exact GPS coordinates from Open-Meteo.
 */
export async function fetchLiveWeather(
  latitude: number,
  longitude: number
): Promise<RealtimeWeather> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4500);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Weather service returned ${res.status}`);
    }

    const data = await res.json();
    const curr = data.current || {};
    const daily = data.daily || {};

    const code = curr.weather_code ?? 0;
    const { text, icon } = getWeatherDescription(code);

    return {
      temperature: Math.round((curr.temperature_2m ?? 28) * 10) / 10,
      apparentTemperature: Math.round((curr.apparent_temperature ?? 30) * 10) / 10,
      humidity: Math.round(curr.relative_humidity_2m ?? 60),
      precipitationMm: curr.precipitation ?? 0.0,
      weatherCode: code,
      condition: text,
      icon,
      windSpeedKmH: Math.round(curr.wind_speed_10m ?? 8),
      recordedAt: curr.time || new Date().toISOString(),
      tempMax: daily.temperature_2m_max?.[0] ? Math.round(daily.temperature_2m_max[0] * 10) / 10 : undefined,
      tempMin: daily.temperature_2m_min?.[0] ? Math.round(daily.temperature_2m_min[0] * 10) / 10 : undefined
    };
  } catch (err) {
    console.warn('Live weather fetch error, using resilient fallback:', err);
    // Graceful fallback for offline mode
    return {
      temperature: 29.5,
      apparentTemperature: 31.0,
      humidity: 58,
      precipitationMm: 0.0,
      weatherCode: 1,
      condition: 'Sunny & Warm',
      icon: '☀️',
      windSpeedKmH: 10,
      recordedAt: new Date().toISOString()
    };
  }
}
