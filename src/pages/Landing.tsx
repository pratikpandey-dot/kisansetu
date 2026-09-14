import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useApp } from "@/lib/i18n";
import { LangThemeControls } from "@/components/LangThemeControls";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpenCheck,
  ChevronRight,
  Gauge,
  IndianRupee,
  Landmark,
  Leaf,
  Radio,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wheat,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router";
import { useEffect, useRef, useState } from "react";
import logo from "@/assets/logo.svg";

/* count-up hook for hero stats */
function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const from = prev.current;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else prev.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

const FEATURE_ACCENTS = [
  "from-emerald-500 to-teal-500 shadow-emerald-500/30",
  "from-sky-500 to-indigo-500 shadow-sky-500/30",
  "from-amber-500 to-orange-500 shadow-amber-500/30",
  "from-fuchsia-500 to-purple-500 shadow-fuchsia-500/30",
];

export default function Landing() {
  const { t } = useApp();
  const stats = useQuery(api.procurement.getStats);
  const rates = useQuery(api.dashboard.getRates);

  // Live platform stats — start at 0 and grow as real farmers register/book.
  const rawFarmers = stats?.farmers ?? 0;
  const rawSlots = stats?.bookings ?? 0;
  const farmerCount = useCountUp(rawFarmers);
  const slotCount = useCountUp(rawSlots);

  const tickerRates = rates ?? [];

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* animated background glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="bg-primary/15 animate-float-slow absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full blur-[130px]" />
        <div className="bg-chart-2/12 animate-float absolute top-1/3 -right-24 h-[360px] w-[420px] rounded-full blur-[110px]" />
        <div className="bg-chart-4/10 animate-float-slow absolute bottom-0 -left-24 h-[320px] w-[380px] rounded-full blur-[110px]" />
      </div>

      {/* ---------------- header ---------------- */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-emerald-950/70 backdrop-blur-md dark:bg-emerald-950/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="group flex items-center gap-2.5">
            <img
              src={logo}
              alt="Kisan Setu"
              className="size-9 rounded-lg transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110"
            />
            <div className="leading-tight">
              <span className="block text-base font-bold text-white">
                {t.brand}
              </span>
              <span className="block text-[10px] font-medium tracking-widest text-emerald-300/80 uppercase">
                {t.tagline}
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <LangThemeControls />
            </div>
            <Link
              to="/auth?tab=official"
              className="hidden items-center gap-1.5 text-xs font-medium text-emerald-200/80 transition-colors hover:text-white md:flex"
            >
              <Landmark className="size-3.5" />
              {t.official.tab}
            </Link>
            <Button
              asChild
              className="rounded-full bg-emerald-500 text-emerald-950 shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.03] hover:bg-emerald-400"
            >
              <Link to="/auth">
                {t.landing.ctaSecondary}
                <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ---------------- hero ---------------- */}
      <section className="relative overflow-hidden bg-emerald-950 text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.28),transparent_60%)]" />
          {/* floating orbs */}
          <div className="animate-float absolute top-24 left-[8%] size-40 rounded-full bg-emerald-400/15 blur-2xl" />
          <div className="animate-float-slow absolute top-1/2 right-[10%] size-56 rounded-full bg-teal-400/12 blur-3xl" />
          <div className="animate-float absolute bottom-10 left-[30%] size-32 rounded-full bg-amber-300/10 blur-2xl [animation-delay:1.2s]" />
          {/* subtle grid */}
          <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:44px_44px]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-emerald-950 to-transparent" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Badge className="mb-6 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-xs font-semibold text-emerald-200">
                <Sparkles className="mr-1.5 size-3.5" />
                Smart Automation · Govt. Procurement
              </Badge>
            </motion.div>
            <h1 className="text-4xl leading-[1.08] font-extrabold tracking-tight sm:text-6xl">
              {t.landing.heroTitle}
            </h1>
            <p className="text-shimmer mx-auto mt-6 max-w-2xl bg-clip-text text-base leading-relaxed font-medium text-emerald-100/80 sm:text-lg">
              {t.landing.heroSub}
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
              >
                <Button
                  asChild
                  size="lg"
                  className="animate-gradient-x h-12 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 px-8 text-base font-semibold text-emerald-950 shadow-xl shadow-emerald-500/30"
                >
                  <Link to="/auth">{t.landing.ctaPrimary}</Link>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
              >
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-full border-white/25 bg-transparent px-8 text-base text-white hover:bg-white/10 hover:text-white"
                >
                  <Link to="/auth">{t.landing.ctaSecondary}</Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* stats — count up */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-3 sm:gap-6"
          >
            {[
              {
                value: farmerCount.toLocaleString("en-IN"),
                label: t.landing.statFarmers,
              },
              {
                value: String(stats?.centers ?? 0),
                label: t.landing.statCentres,
              },
              {
                value: slotCount.toLocaleString("en-IN"),
                label: t.landing.statSlots,
              },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur transition-colors hover:border-emerald-300/40 sm:p-6"
                style={{ transitionDelay: `${i * 40}ms` }}
              >
                <div className="text-2xl font-bold tabular-nums text-emerald-300 sm:text-4xl">
                  {s.value}
                </div>
                <div className="mt-1 text-[11px] font-medium text-emerald-100/70 sm:text-sm">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ---------------- live MSP ticker ---------------- */}
      {tickerRates.length > 0 && (
        <div className="marquee-track relative overflow-hidden border-y border-amber-200/40 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 dark:border-amber-400/20 dark:from-amber-950/60 dark:via-orange-950/50 dark:to-amber-950/60">
          <div className="absolute top-0 left-0 z-10 flex h-full items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 px-3 text-[11px] font-bold tracking-wide text-white uppercase sm:px-4">
            <TrendingUp className="size-3.5" />
            MSP
          </div>
          <div className="animate-marquee flex w-max items-center gap-8 py-2.5 pl-28">
            {[...tickerRates, ...tickerRates].map((r, i) => (
              <span
                key={`${r.crop}-${i}`}
                className="flex items-center gap-1.5 text-sm whitespace-nowrap"
              >
                <Wheat className="text-amber-600 dark:text-amber-400 size-3.5" />
                <span className="font-semibold">{r.crop}</span>
                <span className="font-bold text-amber-700 tabular-nums dark:text-amber-300">
                  ₹{r.pricePerQuintal.toLocaleString("en-IN")}
                </span>
                <span className="text-muted-foreground text-xs">/quintal</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ---------------- features ---------------- */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything in one place
          </h2>
          <p className="text-muted-foreground mt-3">
            Registration to payment — a single bridge between you and the
            procurement centre.
          </p>
        </motion.div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: ShieldCheck,
              title: t.landing.feature1Title,
              body: t.landing.feature1Body,
            },
            {
              icon: BookOpenCheck,
              title: t.landing.feature2Title,
              body: t.landing.feature2Body,
            },
            {
              icon: Radio,
              title: t.landing.feature3Title,
              body: t.landing.feature3Body,
            },
            {
              icon: Sparkles,
              title: t.landing.feature4Title,
              body: t.landing.feature4Body,
            },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className="group bg-card hover:border-primary/30 relative overflow-hidden rounded-2xl border p-6 shadow-sm transition-colors"
            >
              <div
                className={`mb-4 flex size-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${FEATURE_ACCENTS[i % FEATURE_ACCENTS.length]}`}
              >
                <f.icon className="size-5" />
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {f.body}
              </p>
              <div
                className={`absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${FEATURE_ACCENTS[i % FEATURE_ACCENTS.length]}`}
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------------- how it works ---------------- */}
      <section className="bg-secondary/50 border-y py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-2xl text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t.landing.howTitle}
            </h2>
          </motion.div>
          <div className="mt-12 grid gap-6 sm:grid-cols-4">
            {[
              { step: "1", title: t.landing.how1, body: t.landing.how1Body },
              { step: "2", title: t.landing.how2, body: t.landing.how2Body },
              { step: "3", title: t.landing.how3, body: t.landing.how3Body },
              { step: "4", title: t.landing.how4, body: t.landing.how4Body },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="bg-card relative rounded-2xl border p-6"
              >
                <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-chart-5 font-bold text-primary-foreground shadow-md">
                  {s.step}
                </div>
                <h3 className="mt-4 font-semibold">{s.title}</h3>
                <p className="text-muted-foreground mt-1.5 text-sm">{s.body}</p>
                {i < 3 && (
                  <ChevronRight className="text-muted-foreground/40 absolute top-1/2 -right-3 hidden size-5 -translate-y-1/2 sm:block" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- highlight strip ---------------- */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.01 }}
            className="relative overflow-hidden rounded-3xl bg-emerald-950 p-8 text-white"
          >
            <div className="animate-float absolute -top-10 -right-10 size-40 rounded-full bg-emerald-400/15 blur-2xl" />
            <Gauge className="absolute -right-6 -top-6 size-36 text-emerald-500/15" />
            <Wheat className="size-8 text-amber-300" />
            <h3 className="mt-4 text-xl font-bold">
              Live queue, zero crowding
            </h3>
            <p className="mt-2 max-w-sm text-sm text-emerald-100/75">
              Watch farmers ahead of you get served in real time — arrive only
              when it's your turn.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.01 }}
            className="bg-card relative overflow-hidden rounded-3xl border p-8"
          >
            <IndianRupee className="text-primary/10 absolute -right-6 -top-6 size-36" />
            <Leaf className="text-primary size-8" />
            <h3 className="mt-4 text-xl font-bold">
              Payments you can trust
            </h3>
            <p className="text-muted-foreground mt-2 max-w-sm text-sm">
              Every sale is tracked from weighbridge to bank transfer, with
              MSP rates published in-app.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="border-primary/20 from-primary/10 via-card to-chart-2/10 relative overflow-hidden rounded-3xl border bg-gradient-to-br p-10 text-center sm:p-14"
        >
          <div className="bg-primary/10 animate-float absolute -top-16 left-1/4 size-48 rounded-full blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t.landing.ctaTitle}
            </h2>
            <p className="text-muted-foreground mx-auto mt-3 max-w-md">
              {t.landing.ctaBody}
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
              className="mt-8 inline-block"
            >
              <Button
                asChild
                size="lg"
                className="animate-gradient-x h-12 rounded-full bg-gradient-to-r from-primary via-chart-5 to-primary px-10 text-base font-semibold text-primary-foreground shadow-xl shadow-primary/25"
              >
                <Link to="/auth">{t.landing.ctaPrimary}</Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ---------------- footer ---------------- */}
      <footer className="bg-secondary/50 border-t py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <img src={logo} alt="" className="size-6 rounded-md" />
            <span className="text-foreground font-semibold">{t.brand}</span>
            <span className="text-muted-foreground">
              · {t.landing.footerNote}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <LangThemeControls solid />
          </div>
        </div>
      </footer>
    </div>
  );
}
