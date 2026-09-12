import { useEffect, useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useApp } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { Sparkles, Volume2, VolumeX, RefreshCw } from "lucide-react";
import { localeOf } from "@/lib/i18n";

export default function InsightsPage() {
  const { t, lang, easyMode } = useApp();
  const { user } = useAuth();
  const insight = useQuery(api.dashboard.getMyInsight);
  const farmer = useQuery(api.farmers.getMyFarmer);
  const generate = useAction(api.ai.askInsights);
  const [busy, setBusy] = useState(false);
  const [speakOn, setSpeakOn] = useState(false);

  const displayName =
    user?.name || user?.email?.split("@")[0] || (lang === "hi" ? "किसान" : "Farmer");

  const generateInsights = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await generate({ lang });
      toast.success(t.insights.refreshed);
    } catch {
      toast.error(t.chat.error);
    } finally {
      setBusy(false);
    }
  };

  const speakInsights = () => {
    const next = !speakOn;
    setSpeakOn(next);
    if (!next) {
      window.speechSynthesis?.cancel();
      return;
    }
    const text = insight?.text.replace(/^[•·]\s?/gm, "").replace(/\n+/g, ". ");
    if (!text || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = localeOf(lang);
    u.rate = easyMode ? 0.9 : 1;
    window.speechSynthesis.speak(u);
  };

  // Speak when insights arrive while the toggle is on.
  useEffect(() => {
    if (speakOn && insight?.text) speakInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speakOn, insight?.text]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.insights.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.insights.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={speakInsights}
            aria-label={t.chat.readAloud}
            title={t.chat.readAloud}
          >
            {speakOn ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          </Button>
          <Button onClick={generateInsights} disabled={busy}>
            {busy ? (
              <RefreshCw className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {insight ? t.insights.refresh : t.insights.generate}
          </Button>
        </div>
      </div>

      {!farmer && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="py-5 text-sm font-medium text-amber-700 dark:text-amber-400">
            {t.insights.needRegistration}
          </CardContent>
        </Card>
      )}

      <Card className="overflow-hidden border-primary/30">
        <div className="bg-primary flex items-center justify-between px-6 py-4 text-primary-foreground">
          <div className="flex items-center gap-2.5">
            <Logo className="size-8 rounded-lg" />
            <div className="leading-tight">
              <div className="text-sm font-bold">{t.insights.cardTitle}</div>
              <div className="text-[10px] opacity-90">
                {displayName} · {new Date().toLocaleDateString(localeOf(lang))}
              </div>
            </div>
          </div>
          {insight && (
            <Badge
              variant="outline"
              className="border-primary-foreground/30 text-primary-foreground"
            >
              {insight.online ? t.insights.aiPowered : t.chat.offline}
            </Badge>
          )}
        </div>
        <CardContent className="py-6">
          {insight === undefined ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-5 animate-pulse rounded bg-muted" />
              ))}
            </div>
          ) : insight === null || !insight.text ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-2xl">
                <Sparkles className="size-6" />
              </div>
              <p className="text-sm text-muted-foreground">{t.insights.empty}</p>
              <Button onClick={generateInsights} disabled={busy || !farmer}>
                <Sparkles className="size-4" />
                {t.insights.generate}
              </Button>
            </div>
          ) : (
            <ul className="space-y-3">
              {insight.text
                .split("\n")
                .filter((line) => line.trim())
                .map((line, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="bg-primary/15 text-primary mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold">
                      {i + 1}
                    </span>
                    <span className="text-sm leading-relaxed sm:text-base">
                      {line.replace(/^[•·]\s?/, "")}
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-4 text-primary" />
            {t.insights.howTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t.insights.howBody}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
