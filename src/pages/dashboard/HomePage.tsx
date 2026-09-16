import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useApp } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { WeatherCard } from "@/components/WeatherCard";
import {
  ArrowUpRight,
  CalendarClock,
  Clock,
  FileCheck2,
  MapPin,
  Receipt,
  Tags,
  Users,
  Wallet,
} from "lucide-react";
import { Link } from "react-router";
import { useEffect } from "react";
import { motion } from "framer-motion";

export default function HomePage() {
  const { t, lang } = useApp();
  const { user } = useAuth();
  const farmer = useQuery(api.farmers.getMyFarmer);
  const booking = useQuery(api.bookings.getMyBooking);
  const txs = useQuery(api.dashboard.getMyTransactions);
  const docs = useQuery(api.dashboard.getMyDocuments);
  const platform = useQuery(api.procurement.getStats);
  const ensureSeed = useMutation(api.farmers.ensureSeed);
  const seedSlots = useMutation(api.dashboard.seedSlotsForDay);

  useEffect(() => {
    ensureSeed();
    seedSlots({ day: startOfToday() });
  }, [ensureSeed, seedSlots]);

  const displayName =
    user?.name ||
    user?.email?.split("@")[0] ||
    (lang === "hi" ? "किसान" : "Farmer");

  const verified = farmer?.verificationStatus === "verified";
  const active = booking?.active ?? null;

  const totalPaid = (txs ?? [])
    .filter((tx) => tx.status === "paid")
    .reduce((s, tx) => s + tx.amount, 0);
  const totalPending = (txs ?? [])
    .filter((tx) => tx.status === "pending")
    .reduce((s, tx) => s + tx.amount, 0);

  /* distinct accent per quick action — modern multi-color look */
  const quickActions = [
    {
      to: "/dashboard/book",
      icon: CalendarClock,
      label: t.home.bookSlot,
      tile: "from-violet-500 to-indigo-500 shadow-violet-500/25",
    },
    {
      to: "/dashboard/documents",
      icon: FileCheck2,
      label: t.home.uploadDoc,
      tile: "from-sky-500 to-cyan-500 shadow-sky-500/25",
    },
    {
      to: "/dashboard/prices",
      icon: Tags,
      label: t.home.viewPrices,
      tile: "from-amber-500 to-orange-500 shadow-amber-500/25",
    },
  ];

  return (
    <div className="space-y-6">
      {/* gradient welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-6 text-white shadow-xl shadow-emerald-900/15 sm:p-8"
      >
        <Logo className="absolute -right-8 -top-8 size-44 opacity-[0.12]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.12),transparent_50%)]" />
        <p className="relative text-sm font-medium text-emerald-100/90">
          {t.home.greeting} 👋
        </p>
        <h1 className="relative mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
          {displayName}
        </h1>
        <div className="relative mt-5 flex flex-wrap items-center gap-2">
          <Badge
            className={
              verified
                ? "rounded-full border-white/25 bg-white/15 text-white"
                : "rounded-full border-amber-200/40 bg-amber-300/20 text-amber-50"
            }
          >
            <FileCheck2 className="mr-1.5 size-3.5" />
            {verified ? t.home.verified : t.home.verificationPending}
          </Badge>
          {active ? (
            <Badge className="rounded-full border-white/25 bg-white/15 text-white">
              <Clock className="mr-1.5 size-3.5" />
              {t.home.activeBooking} · #{active.booking.queueToken}
            </Badge>
          ) : (
            <Badge className="rounded-full border-white/25 bg-white/10 text-emerald-50/90">
              {t.home.noBooking}
            </Badge>
          )}
        </div>
      </motion.div>

      {/* not registered banner */}
      {!farmer && (
        <Card className="border-primary/30 bg-gradient-to-r from-primary/10 via-card to-transparent">
          <CardContent className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">{t.home.notRegistered}</CardTitle>
              <CardDescription>
                {t.register.title} → {t.docs.title} → {t.booking.title}
              </CardDescription>
            </div>
            <Button asChild>
              <Link to="/dashboard/register">{t.home.registerNow}</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* verification status card (when registered, banner already shows badge) */}
      {farmer && !verified && (
        <Card className="border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-card to-transparent">
          <CardContent className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <FileCheck2 className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base">
                  {t.home.verificationPending}
                </CardTitle>
                <CardDescription>
                  {t.home.verificationPendingBody}
                </CardDescription>
              </div>
            </div>
            <Button asChild variant="outline">
              <Link to="/dashboard/documents">{t.nav.documents}</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* active booking / live queue */}
      {active && active.slot ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
        >
          <Card className="overflow-hidden border-sky-500/30">
            <div className="bg-gradient-to-r from-sky-600 to-indigo-600 px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">
                  {t.home.activeBooking}
                </span>
                <Badge
                  variant="outline"
                  className="rounded-full border-white/30 text-white"
                >
                  #{active.booking.queueToken}
                </Badge>
              </div>
            </div>
            <CardContent className="grid gap-6 pt-6 sm:grid-cols-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t.queue.yourPosition}
                </p>
                <p className="mt-1 text-4xl font-extrabold text-sky-600 dark:text-sky-400">
                  {active.position}
                  <span className="text-lg font-semibold text-muted-foreground">
                    {" "}
                    / {active.totalInQueue}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {active.position - 1 > 0
                    ? `${active.position - 1} ${t.home.ahead}`
                    : t.queue.active}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t.queue.slotLabel}
                </p>
                <p className="mt-1 flex items-center gap-1.5 font-semibold">
                  <Clock className="size-4 text-muted-foreground" />
                  {active.slot.label}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="size-4 shrink-0" />
                  <span className="truncate">{active.centerName}</span>
                </p>
              </div>
              <div className="flex items-end">
                <Button
                  asChild
                  className="w-full bg-sky-600 text-white hover:bg-sky-500"
                >
                  <Link to="/dashboard/queue">{t.nav.queue}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-start gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">{t.home.noBooking}</CardTitle>
              <CardDescription>{t.home.noBookingBody}</CardDescription>
            </div>
            <Button asChild variant="outline" disabled={!verified}>
              <Link to="/dashboard/book">{t.home.bookSlot}</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* quick actions — colored tiles */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">{t.home.quickActions}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {quickActions.map((a, i) => (
            <motion.div
              key={a.to}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 + i * 0.06 }}
            >
              <Link to={a.to}>
                <Card className="group h-full transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <CardContent className="flex items-center gap-3">
                    <div
                      className={`flex size-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg transition-transform group-hover:scale-105 ${a.tile}`}
                    >
                      <a.icon className="size-5" />
                    </div>
                    <span className="flex-1 font-medium">{a.label}</span>
                    <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* live weather strip */}
      <WeatherCard compact />

      {/* stats + recent transactions */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="size-4 text-emerald-600 dark:text-emerald-400" />
              {t.landing.statFarmers}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-4xl font-extrabold text-transparent dark:from-emerald-400 dark:to-teal-300">
                {(platform?.farmers ?? 0).toLocaleString("en-IN")}
              </span>
              <span className="pb-1 text-sm text-muted-foreground">
                {t.landing.footerNote}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                {
                  icon: FileCheck2,
                  label: t.home.statDocs,
                  value: docs?.length ?? 0,
                  tone: "text-sky-600 dark:text-sky-400 bg-sky-500/10",
                },
                {
                  icon: Receipt,
                  label: t.home.statTx,
                  value: txs?.length ?? 0,
                  tone: "text-violet-600 dark:text-violet-400 bg-violet-500/10",
                },
                {
                  icon: Wallet,
                  label: t.history.paid,
                  value: `₹${totalPaid.toLocaleString("en-IN")}`,
                  tone: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border bg-gradient-to-b from-card to-secondary/40 p-3"
                >
                  <div
                    className={`flex size-8 items-center justify-center rounded-lg ${s.tone}`}
                  >
                    <s.icon className="size-4" />
                  </div>
                  <div className="mt-2 truncate text-lg font-bold">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
            {totalPending > 0 && (
              <p className="mt-3 rounded-lg bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-700 dark:text-amber-400">
                {t.history.totalPending}: ₹{totalPending.toLocaleString("en-IN")}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">{t.home.recentTx}</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/dashboard/history">{t.common.viewAll}</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {(txs ?? []).slice(0, 4).map((tx) => (
              <div
                key={tx._id}
                className="flex items-center justify-between rounded-xl border p-3 transition-colors hover:bg-accent/50"
              >
                <div>
                  <div className="font-medium">{tx.crop}</div>
                  <div className="text-xs text-muted-foreground">
                    {tx.quantityQuintal} q · ₹{tx.ratePerQuintal}/q
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    ₹{tx.amount.toLocaleString("en-IN")}
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      tx.status === "paid"
                        ? "rounded-full border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                        : "rounded-full border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                    }
                  >
                    {tx.status === "paid" ? t.history.paid : t.history.pending}
                  </Badge>
                </div>
              </div>
            ))}
            {txs && txs.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {t.home.noTx}
              </p>
            )}
            {!txs && (
              <div className="space-y-3 py-2">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-14 animate-pulse rounded-xl bg-muted"
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function startOfToday(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
