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
  Wheat,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router";
import logo from "@/assets/logo.svg";

export default function Landing() {
  const { t } = useApp();
  const stats = useQuery(api.procurement.getStats);

  const farmerCount = 18000 + (stats?.farmers ?? 0);
  const slotCount = 900 + (stats?.bookings ?? 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* soft background glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute right-0 top-1/2 h-[300px] w-[400px] rounded-full bg-chart-2/10 blur-[100px]" />
      </div>

      {/* ---------------- header ---------------- */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-emerald-950/70 backdrop-blur-md dark:bg-emerald-950/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="Kisan Setu" className="size-9 rounded-lg" />
            <div className="leading-tight">
              <span className="block text-base font-bold text-white">
                {t.brand}
              </span>
              <span className="block text-[10px] font-medium uppercase tracking-widest text-emerald-300/80">
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
              className="rounded-full bg-emerald-500 text-emerald-950 hover:bg-emerald-400"
            >
              <Link to="/auth">
                {t.landing.ctaSecondary}
                <ChevronRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ---------------- hero ---------------- */}
      <section className="relative overflow-hidden bg-emerald-950 text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.25),transparent_60%)]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-emerald-950 to-transparent" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <Badge className="mb-6 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-xs font-semibold text-emerald-200">
              <Sparkles className="mr-1.5 size-3.5" />
              Smart Automation · Govt. Procurement
            </Badge>
            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl">
              {t.landing.heroTitle}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-emerald-100/80 sm:text-lg">
              {t.landing.heroSub}
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full bg-emerald-500 px-8 text-base font-semibold text-emerald-950 shadow-lg shadow-emerald-500/25 hover:bg-emerald-400"
              >
                <Link to="/auth">{t.landing.ctaPrimary}</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-white/25 bg-transparent px-8 text-base text-white hover:bg-white/10 hover:text-white"
              >
                <Link to="/auth">{t.landing.ctaSecondary}</Link>
              </Button>
            </div>
          </motion.div>

          {/* stats */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-3 sm:gap-6"
          >
            {[
              {
                value: farmerCount.toLocaleString("en-IN") + "+",
                label: t.landing.statFarmers,
              },
              { value: String(stats?.centers || 3), label: t.landing.statCentres },
              {
                value: slotCount.toLocaleString("en-IN") + "+",
                label: t.landing.statSlots,
              },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur sm:p-6"
              >
                <div className="text-2xl font-bold text-emerald-300 sm:text-4xl">
                  {s.value}
                </div>
                <div className="mt-1 text-[11px] font-medium text-emerald-100/70 sm:text-sm">
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ---------------- features ---------------- */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything in one place
          </h2>
          <p className="mt-3 text-muted-foreground">
            Registration to payment — a single bridge between you and the
            procurement centre.
          </p>
        </div>
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
              className="group rounded-2xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <f.icon className="size-5" />
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {f.body}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------------- how it works ---------------- */}
      <section className="border-y bg-secondary/50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t.landing.howTitle}
            </h2>
          </div>
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
                className="relative rounded-2xl border bg-card p-6"
              >
                <div className="flex size-9 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
                  {s.step}
                </div>
                <h3 className="mt-4 font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.body}</p>
                {i < 3 && (
                  <ChevronRight className="absolute -right-3 top-1/2 hidden size-5 -translate-y-1/2 text-muted-foreground/40 sm:block" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- highlight strip ---------------- */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="relative overflow-hidden rounded-3xl bg-emerald-950 p-8 text-white">
            <Gauge className="absolute -right-6 -top-6 size-36 text-emerald-500/15" />
            <Wheat className="size-8 text-amber-300" />
            <h3 className="mt-4 text-xl font-bold">
              Live queue, zero crowding
            </h3>
            <p className="mt-2 max-w-sm text-sm text-emerald-100/75">
              Watch farmers ahead of you get served in real time — arrive only
              when it's your turn.
            </p>
          </div>
          <div className="relative overflow-hidden rounded-3xl border bg-card p-8">
            <IndianRupee className="absolute -right-6 -top-6 size-36 text-primary/10" />
            <Leaf className="size-8 text-primary" />
            <h3 className="mt-4 text-xl font-bold">
              Payments you can trust
            </h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Every sale is tracked from weighbridge to bank transfer, with
              MSP rates published in-app.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="rounded-3xl border bg-gradient-to-br from-primary/10 via-card to-chart-2/10 p-10 text-center sm:p-14">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t.landing.ctaTitle}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            {t.landing.ctaBody}
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 h-12 rounded-full px-10 text-base font-semibold shadow-lg shadow-primary/25"
          >
            <Link to="/auth">{t.landing.ctaPrimary}</Link>
          </Button>
        </div>
      </section>

      {/* ---------------- footer ---------------- */}
      <footer className="border-t bg-secondary/50 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <img src={logo} alt="" className="size-6 rounded-md" />
            <span className="font-semibold text-foreground">{t.brand}</span>
            <span className="text-muted-foreground">· {t.landing.footerNote}</span>
          </div>
          <div className="flex items-center gap-4">
            <LangThemeControls solid />
          </div>
        </div>
      </footer>
    </div>
  );
}
