import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useApp } from "@/lib/i18n";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp } from "lucide-react";

const CROP_HI: Record<string, string> = {
  Wheat: "गेहूं",
  "Paddy (Common)": "धान (सामान्य)",
  "Paddy (Grade A)": "धान (ग्रेड A)",
  Maize: "मक्का",
  "Gram (Chana)": "चना",
  Mustard: "सरसों",
  Barley: "जौ",
  Soybean: "सोयाबीन",
  Sesamum: "तिल",
  "Tur (Arhar)": "अरहर",
};

export default function PricesPage() {
  const { t, lang } = useApp();
  const rates = useQuery(api.dashboard.getRates);
  const [q, setQ] = useState("");

  const filtered = useMemo(
    () =>
      (rates ?? []).filter(
        (r) =>
          r.crop.toLowerCase().includes(q.toLowerCase()) ||
          (CROP_HI[r.crop] ?? "").includes(q),
      ),
    [rates, q],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.prices.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t.prices.subtitle}
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.prices.searchPlaceholder}
            className="pl-9"
          />
        </div>
      </div>

      {rates === undefined ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <Card key={r._id} className="transition-all hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="flex items-center gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-chart-2/15 text-chart-2">
                  <TrendingUp className="size-5" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="truncate text-base">
                    {lang === "hi" && CROP_HI[r.crop]
                      ? `${r.crop} · ${CROP_HI[r.crop]}`
                      : r.crop}
                  </CardTitle>
                  <CardDescription>
                    <span className="text-lg font-bold text-primary">
                      ₹{r.pricePerQuintal.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs"> / {t.prices.crop}</span>
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="ml-auto shrink-0 text-[10px]">
                  MSP
                </Badge>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <Card className="border-dashed sm:col-span-2 lg:col-span-3">
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                {t.prices.searchPlaceholder}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
