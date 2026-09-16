"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";

/* ------------------------------------------------------------------ */
/* Shared weather shape returned to the frontend                       */
/* ------------------------------------------------------------------ */

export type SkyCondition =
  | "sunny"
  | "partly"
  | "cloudy"
  | "rain"
  | "thunder"
  | "fog"
  | "snow";

export interface DayForecast {
  date: string;
  minC: number;
  maxC: number;
  rainChance: number;
  condition: SkyCondition;
}

export interface WeatherResult {
  place: string;
  tempC: number;
  feelsLikeC: number;
  humidity: number;
  windKph: number;
  rainChance: number;
  condition: SkyCondition;
  forecast: DayForecast[];
  source: "weatherapi" | "open-meteo";
}

const PLACEHOLDER = "your_api_key_here";

/* ------------------------------------------------------------------ */
/* Condition normalisation                                             */
/* ------------------------------------------------------------------ */

function fromText(text: string): SkyCondition {
  const t = text.toLowerCase();
  if (t.includes("thunder")) return "thunder";
  if (t.includes("snow") || t.includes("sleet") || t.includes("ice")) return "snow";
  if (t.includes("rain") || t.includes("drizzle") || t.includes("shower")) return "rain";
  if (t.includes("fog") || t.includes("mist") || t.includes("haze")) return "fog";
  if (t.includes("overcast")) return "cloudy";
  if (t.includes("cloud")) return t.includes("part") ? "partly" : "cloudy";
  if (t.includes("sun") || t.includes("clear")) return "sunny";
  return "cloudy";
}

function fromWmo(code: number): SkyCondition {
  if (code === 0) return "sunny";
  if (code === 1 || code === 2) return "partly";
  if (code === 3) return "cloudy";
  if (code === 45 || code === 48) return "fog";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
  if (code >= 95) return "thunder";
  return "cloudy";
}

async function fetchJson(url: string, timeoutMs = 10000): Promise<unknown | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    return (await res.json()) as unknown;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Provider 1 — WeatherAPI.com (uses WEATHER_API_KEY)                  */
/* ------------------------------------------------------------------ */

interface WeatherApiResp {
  location?: { name?: string; region?: string };
  current?: {
    temp_c?: number;
    feelslike_c?: number;
    humidity?: number;
    wind_kph?: number;
    condition?: { text?: string };
  };
  forecast?: {
    forecastday?: {
      date?: string;
      day?: {
        maxtemp_c?: number;
        mintemp_c?: number;
        daily_chance_of_rain?: number;
        condition?: { text?: string };
      };
    }[];
  };
}

async function fromWeatherApi(
  key: string,
  lat: number,
  lon: number,
): Promise<WeatherResult | null> {
  const url =
    `https://api.weatherapi.com/v1/forecast.json?key=${encodeURIComponent(key)}` +
    `&q=${lat},${lon}&days=3&aqi=no&alerts=no`;
  const data = (await fetchJson(url)) as WeatherApiResp | null;
  const cur = data?.current;
  const days = data?.forecast?.forecastday ?? [];
  if (!cur || typeof cur.temp_c !== "number" || days.length === 0) return null;

  const today = days[0]?.day;
  return {
    place:
      [data?.location?.name, data?.location?.region]
        .filter(Boolean)
        .join(", ") || "Your area",
    tempC: Math.round(cur.temp_c),
    feelsLikeC: Math.round(cur.feelslike_c ?? cur.temp_c),
    humidity: cur.humidity ?? 0,
    windKph: Math.round(cur.wind_kph ?? 0),
    rainChance: Math.round(today?.daily_chance_of_rain ?? 0),
    condition: fromText(cur.condition?.text ?? ""),
    forecast: days.slice(0, 3).map((d) => ({
      date: d.date ?? "",
      minC: Math.round(d.day?.mintemp_c ?? 0),
      maxC: Math.round(d.day?.maxtemp_c ?? 0),
      rainChance: Math.round(d.day?.daily_chance_of_rain ?? 0),
      condition: fromText(d.day?.condition?.text ?? ""),
    })),
    source: "weatherapi",
  };
}

/* ------------------------------------------------------------------ */
/* Provider 2 — Open-Meteo (no key needed, graceful fallback)          */
/* ------------------------------------------------------------------ */

interface OpenMeteoResp {
  current?: {
    temperature_2m?: number;
    apparent_temperature?: number;
    relative_humidity_2m?: number;
    weather_code?: number;
    wind_speed_10m?: number;
  };
  daily?: {
    time?: string[];
    weather_code?: number[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    precipitation_probability_max?: number[];
  };
}

async function fromOpenMeteo(
  lat: number,
  lon: number,
): Promise<WeatherResult | null> {
  const url =
    "https://api.open-meteo.com/v1/forecast" +
    `?latitude=${lat}&longitude=${lon}` +
    "&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m" +
    "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max" +
    "&timezone=auto&forecast_days=3";
  const data = (await fetchJson(url)) as OpenMeteoResp | null;
  const cur = data?.current;
  const d = data?.daily;
  if (!cur || typeof cur.temperature_2m !== "number" || !d?.time?.length) return null;

  const n = Math.min(d.time.length, 3);
  return {
    place: "Your area",
    tempC: Math.round(cur.temperature_2m),
    feelsLikeC: Math.round(cur.apparent_temperature ?? cur.temperature_2m),
    humidity: cur.relative_humidity_2m ?? 0,
    windKph: Math.round(cur.wind_speed_10m ?? 0),
    rainChance: d.precipitation_probability_max?.[0] ?? 0,
    condition: fromWmo(cur.weather_code ?? 3),
    forecast: Array.from({ length: n }, (_, i) => ({
      date: d.time?.[i] ?? "",
      minC: Math.round(d.temperature_2m_min?.[i] ?? 0),
      maxC: Math.round(d.temperature_2m_max?.[i] ?? 0),
      rainChance: d.precipitation_probability_max?.[i] ?? 0,
      condition: fromWmo(d.weather_code?.[i] ?? 3),
    })),
    source: "open-meteo",
  };
}

/* ------------------------------------------------------------------ */
/* Public action                                                       */
/* ------------------------------------------------------------------ */

/** Default location — Jhansi (BIET office) when geolocation is denied. */
export const DEFAULT_PLACE = { lat: 25.4483, lon: 78.5696, name: "Jhansi" };

export const getWeather = action({
  args: { lat: v.number(), lon: v.number() },
  handler: async (_ctx, args): Promise<WeatherResult | null> => {
    const key = process.env.WEATHER_API_KEY;
    if (key && key.trim() !== "" && key.trim() !== PLACEHOLDER) {
      const w = await fromWeatherApi(key.trim(), args.lat, args.lon);
      if (w) return w;
    }
    // Keyless fallback so the feature works out of the box.
    return await fromOpenMeteo(args.lat, args.lon);
  },
});
