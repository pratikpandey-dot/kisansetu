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
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/Logo";
import {
  BookSlotIcon,
  Clock,
  FileCheck2,
  MapPin,
  Receipt,
  Tags,
  Users,
} from "lucide-react";
import { Link } from "react-router";
import { useEffect } from "react";

export default function HomePage() {
  const { t, lang } = useApp();
  const { user } = useAuth();
  const farmer = useQuery(api.farmers.getMyFarmer);
  const booking = useQuery(api.bookings.getMyBooking);
  const txs = useQuery(api.dashboard.getMyTransactions);
  const docs = useQuery(api.dashboard.getMyDocuments);
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

  const stats = [
    { icon: FileCheck2, label: t.home.statDocs, value: docs?.length ?? 0 },
    { icon: Receipt, label: t.home.statTx, value: txs?.length ?? 0 },
  ];

  return (
    <div className="space-y-6">
      {/* greeting */}
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          {t.home.greeting} 👋
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">{displayName}</h1>
      </div>

      {/* not registered banner */}
      {!farmer && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">
                {t.home.notRegistered}
              </CardTitle>
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

      {/* verification status */}
      {farmer && (
        <Card
          className={
            verified
              ? "border-emerald-500/30 bg-emerald-500/5"
              : "border-amber-500/30 bg-amber-500/5"
          }
        >
          <CardContent className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                  verified
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                }`}
              >
                <FileCheck2 className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base">
                  {verified ? t.home.verified : t.home.verificationPending}
                </CardTitle>
                <CardDescription>
                  {verified
                    ? t.home.verifiedBody
                    : t.home.verificationPendingBody}
                </CardDescription>
              </div>
            </div>
            {!verified && (
              <Button asChild variant="outline">
                <Link to="/dashboard/documents">{t.nav.documents}</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* active booking / live queue */}
      {active && active.slot ? (
        <Card className="overflow-hidden border-primary/30">
          <div className="bg-primary px-6 py-4 text-primary-foreground">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">
                {t.home.activeBooking}
              </span>
              <Badge
                variant="outline"
                className="border-primary-foreground/30 text-primary-foreground"
              >
                {active.booking.queueToken}
              </Badge>
            </div>
          </div>
          <CardContent className="grid gap-6 pt-6 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t.queue.yourPosition}
              </p>
              <p className="mt-1 text-4xl font-extrabold text-primary">
                {active.position}
                <span className="text-lg font-semibold text-muted-foreground">
                  {t.home.of}
                  {active.totalInQueue}
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
              <Button asChild className="w-full">
                <Link to="/dashboard/queue">{t.nav.queue}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
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

      {/* quick actions */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">{t.home.quickActions}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              to: "/dashboard/book",
              icon: BookSlotIcon,
              label: t.home.bookSlot,
            },
            {
              to: "/dashboard/documents",
              icon: FileCheck2,
              label: t.home.uploadDoc,
            },
            { to: "/dashboard/prices", icon: Tags, label: t.home.viewPrices },
          ].map((a) => (
            <Link key={a.to} to={a.to}>
              <Card className="group h-full transition-all hover:-translate-y-0.5 hover:shadow-md">
                <CardContent className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <a.icon className="size-5" />
                  </div>
                  <span className="font-medium">{a.label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* stats + recent transactions */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="size-4 text-primary" />
              {t.landing.statFarmers}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-extrabold text-primary">
                18,000+
              </span>
              <span className="pb-1 text-sm text-muted-foreground">
                {t.landing.footerNote}
              </span>
            </div>
            <Separator className="my-4" />
            <div className="grid grid-cols-2 gap-4">
              {stats.map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-secondary">
                    <s.icon className="size-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-xl font-bold">{s.value}</div>
                    <div className="text-xs text-muted-foreground">
                      {s.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
                className="flex items-center justify-between rounded-lg border p-3"
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
                    variant={tx.status === "paid" ? "default" : "secondary"}
                    className={
                      tx.status === "paid"
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                        : ""
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
                    className="h-14 animate-pulse rounded-lg bg-muted"
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
