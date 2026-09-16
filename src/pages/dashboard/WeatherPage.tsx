import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useApp } from "@/lib/i18n";
import { WeatherCard } from "@/components/WeatherCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CloudFog,
  CloudLightning,
  Droplets,
  Sprout,
  Thermometer,
  type LucideIcon,
} from "lucide-react";
import type { SkyCondition } from "@/convex/weather";
import { motion } from "framer-motion";

/** Per-condition simple farming advisories (localized via i18n keys). */
const ADVISORY_KEY: Record<SkyCondition, keyof ReturnType<typeof useApp>["t"]["weather"]["advisory"]> = {
  sunny: "sunny",
  partly: "partly",
  cloudy: "cloudy",
  rain: "rain",
  thunder: "thunder",
  fog: "fog",
  snow: "cloudy",
};

const ADVISORY_STYLE: Record<SkyCondition, string> = {
  sunny: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
  partly: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30",
  cloudy: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30",
  rain: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30",
  thunder: "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/30",
  fog: "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border-zinc-500/30",
  snow: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/30",
};

const ADVISORY_ICON: Record<SkyCondition, LucideIcon> = {
  sunny: Sprout,
  partly: Sprout,
  cloudy: Sprout,
  rain: Droplets,
  thunder: CloudLightning,
  fog: CloudFog,
  snow: Thermometer,
};

export default function WeatherPage() {
  const { t } = useApp();
  // Rates come from the DB so the advisory can reference real crops if needed.
  void useQuery(api.dashboard.getRates);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t.weather.title}</h1>
        <p className="text-muted-foreground mt-1">{t.weather.subtitle}</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <WeatherCard />
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sprout className="size-4 text-emerald-600 dark:text-emerald-400" />
            {t.weather.advisoryTitle}
          </CardTitle>
          <CardDescription>{t.weather.advisoryBody}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {(Object.keys(ADVISORY_KEY) as SkyCondition[]).map((k) => {
            const AIcon = ADVISORY_ICON[k];
            return (
              <div
                key={k}
                className={`flex items-start gap-3 rounded-xl border p-3.5 ${ADVISORY_STYLE[k]}`}
              >
                <AIcon className="mt-0.5 size-5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">{t.weather[k]}</p>
                  <p className="mt-0.5 text-xs leading-relaxed opacity-90">
                    {t.weather.advisory[ADVISORY_KEY[k]]}
                  </p>
                </div>
              </div>
              );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
