import { useCallback, useEffect, useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useApp } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  Droplets,
  MapPin,
  Navigation,
  RefreshCw,
  Snowflake,
  Sun,
  Wind,
  type LucideIcon,
} from "lucide-react";
import type { WeatherResult, SkyCondition } from "@/convex/weather";

const CONDITION_ICON: Record<SkyCondition, LucideIcon> = {
  sunny: Sun,
  partly: CloudSun,
  cloudy: Cloud,
  rain: CloudRain,
  thunder: CloudLightning,
  fog: CloudFog,
  snow: Snowflake,
};

/** Gradient + glow tint per condition for a colorful modern card. */
const CONDITION_STYLE: Record<SkyCondition, string> = {
  sunny: "from-amber-400 via-orange-400 to-amber-500",
  partly: "from-sky-400 via-sky-500 to-cyan-500",
  cloudy: "from-slate-400 via-slate-500 to-slate-600",
  rain: "from-blue-500 via-indigo-500 to-blue-600",
  thunder: "from-violet-500 via-purple-600 to-indigo-700",
  fog: "from-gray-400 via-zinc-400 to-slate-500",
  snow: "from-cyan-300 via-sky-300 to-blue-400",
};

/** Default — Jhansi (BIET office) when geolocation is unavailable/denied. */
const FALLBACK = { lat: 25.4483, lon: 78.5696 };

function getPosition(): Promise<GeolocationPosition | null> {
  return new Promise((resolve) => {
    if (!("geolocation" in navigator)) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos),
      () => resolve(null),
      { timeout: 8000, maximumAge: 600_000 },
    );
  });
}

export function WeatherCard({ compact = false }: { compact?: boolean }) {
  const { t, easyMode } = useApp();
  const getWeather = useAction(api.weather.getWeather);
  const [data, setData] = useState<WeatherResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [usedGps, setUsedGps] = useState(false);

  /** Fetch via promise callbacks (no sync setState in the mount effect). */
  const fetchWeather = useCallback(() => {
      getPosition()
        .then((pos) => {
          const gpsOk = pos !== null;
          const lat = pos ? pos.coords.latitude : FALLBACK.lat;
          const lon = pos ? pos.coords.longitude : FALLBACK.lon;
          setUsedGps(gpsOk);
          setLoading(true);
          return getWeather({ lat, lon });
        })
        .then((res) => {
          setData(res);
        })
        .catch(() => {
          setData(null);
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [getWeather],
  );

  const load = useCallback(
    async (gps: boolean) => {
      setLoading(true);
      try {
        let lat = FALLBACK.lat;
        let lon = FALLBACK.lon;
        let gpsOk = false;
        if (gps) {
          const pos = await getPosition();
          gpsOk = pos !== null;
          if (pos) {
            lat = pos.coords.latitude;
            lon = pos.coords.longitude;
          }
        }
        setUsedGps(gpsOk);
        const res = await getWeather({ lat, lon });
        setData(res);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    },
    [getWeather],
  );

  useEffect(() => {
    // Mount fetch via promise chain — every setState fires in a callback,
    // which is the pattern the react-hooks effect rule recommends.
    fetchWeather();
  }, [fetchWeather]);

  const Icon = data ? CONDITION_ICON[data.condition] : CloudSun;
  const tint = data ? CONDITION_STYLE[data.condition] : "from-sky-400 to-cyan-500";

  const dayLabel = (iso: string, i: number) =>
    i === 0 ? t.weather.today : new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short" });

  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${tint} p-5 text-white shadow-lg transition-colors duration-500 sm:p-6`}
    >
      {/* animated glow */}
      <div className="animate-float pointer-events-none absolute -top-10 -right-10 size-40 rounded-full bg-white/20 blur-2xl" />
      <div className="animate-float-slow pointer-events-none absolute -bottom-12 -left-8 size-36 rounded-full bg-white/10 blur-2xl" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase opacity-90">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">{data?.place ?? t.weather.title}</span>
          </p>
          {data ? (
            <p className="mt-2 flex items-center gap-3">
              <span className={easyMode ? "text-6xl font-extrabold" : "text-5xl font-extrabold"}>
                {data.tempC}°
              </span>
              <span className="text-sm leading-tight opacity-95">
                {t.weather[data.condition]}
                <span className="block text-xs opacity-80">
                  {t.weather.feelsLike} {data.feelsLikeC}°C
                </span>
              </span>
            </p>
          ) : (
            <p className="mt-2 text-2xl font-bold opacity-90">
              {loading ? t.weather.loading : t.weather.unavailable}
            </p>
          )}
        </div>
        <div className="relative shrink-0">
          <Icon className={`size-12 sm:size-14 ${loading ? "animate-pulse opacity-60" : "drop-shadow-lg"}`} />
        </div>
      </div>

      {data && (
        <>
          {/* current metrics */}
          <div className="relative mt-4 flex flex-wrap items-center gap-2 text-xs font-medium">
            <span className="flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1">
              <Droplets className="size-3.5" /> {t.weather.humidity} {data.humidity}%
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1">
              <CloudRain className="size-3.5" /> {t.weather.rain} {data.rainChance}%
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1">
              <Wind className="size-3.5" /> {data.windKph} km/h
            </span>
          </div>

          {/* 3-day forecast */}
          {!compact && (
            <div className="relative mt-4 grid grid-cols-3 gap-2">
              {data.forecast.map((d, i) => {
                const DayIcon = CONDITION_ICON[d.condition];
                return (
                  <div
                    key={d.date + i}
                    className="rounded-xl bg-white/15 px-2 py-2.5 text-center backdrop-blur-sm"
                  >
                    <p className="text-[11px] font-semibold opacity-90">{dayLabel(d.date, i)}</p>
                    <DayIcon className="mx-auto mt-1 size-5 opacity-95" />
                    <p className="mt-1 text-xs font-bold tabular-nums">
                      {d.maxC}° <span className="font-medium opacity-75">{d.minC}°</span>
                    </p>
                    <p className="text-[10px] opacity-80">
                      <CloudRain className="inline size-2.5" /> {d.rainChance}%
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          <div className="relative mt-4 flex items-center justify-between gap-2">
            <p className="text-[10px] leading-tight opacity-75">
              {data.source === "weatherapi" ? t.weather.viaKey : t.weather.viaFree}
            </p>
            <div className="flex gap-1.5">
              <Button
                size="sm"
                variant="secondary"
                className="h-7 rounded-full bg-white/25 px-2.5 text-[11px] font-semibold text-white hover:bg-white/35"
                onClick={() => void load(true)}
                disabled={loading}
                title={t.weather.useGps}
              >
                <Navigation className="mr-1 size-3" />
                {t.weather.useGps}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="h-7 w-7 rounded-full bg-white/25 p-0 text-white hover:bg-white/35"
                onClick={() => void load(usedGps)}
                disabled={loading}
                title={t.weather.refresh}
              >
                <RefreshCw className={`size-3 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
