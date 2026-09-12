import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useApp } from "@/lib/i18n";
import { LangThemeControls } from "@/components/LangThemeControls";
import { RequireAuth } from "@/components/RequireAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import {
  BadgeCheck,
  Landmark,
  Loader2,
  LogOut,
  Search,
  ShieldCheck,
  Users,
  Wallet,
  CalendarClock,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";

/* ------------------------------------------------------------------ */
/* Guard: signed in AND has a linked official profile                  */
/* ------------------------------------------------------------------ */

function RequireOfficial({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();
  const myOfficial = useQuery(api.officials.getMyOfficial);

  if (isLoading || myOfficial === undefined) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </main>
    );
  }
  if (myOfficial === null) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">
        <Card className="max-w-sm text-center">
          <CardContent className="p-6">
            <ShieldCheck className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">Access denied</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Sign in with an official email + access code on the auth page.
            </p>
            <Button className="mt-4 w-full" onClick={() => (window.location.href = "/auth")}>
              Go to sign in
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }
  return children;
}

/* ------------------------------------------------------------------ */
/* Small stat card                                                     */
/* ------------------------------------------------------------------ */

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
}) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-bold leading-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status, t }: { status: string; t: ReturnType<typeof useApp>["t"] }) {
  const map: Record<string, { label: string; cls: string }> = {
    verified: {
      label: t.official.verified,
      cls: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    },
    pending: {
      label: t.official.pendingVerify,
      cls: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    },
    rejected: {
      label: t.official.rejected,
      cls: "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-400",
    },
  };
  const s = map[status] ?? map.pending;
  return <Badge variant="outline" className={s.cls}>{s.label}</Badge>;
}

const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

/* ------------------------------------------------------------------ */
/* Main page                                                           */
/* ------------------------------------------------------------------ */

function OfficialAppInner() {
  const { signOut } = useAuth();
  const { t } = useApp();
  const navigate = useNavigate();
  const myOfficial = useQuery(api.officials.getMyOfficial);
  const overview = useQuery(api.officials.getOverview);
  const farmers = useQuery(api.officials.listFarmers);
  const pendingTx = useQuery(api.officials.listPendingTransactions);

  const setVerificationStatus = useMutation(api.officials.setVerificationStatus);
  const markTransactionPaid = useMutation(api.officials.markTransactionPaid);

  const [view, setView] = useState<"overview" | "farmers" | "payments">("overview");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!farmers) return [];
    const needle = q.trim().toLowerCase();
    if (!needle) return farmers;
    return farmers.filter((f) =>
      [f.name, f.village, f.district, f.phone].some((v) =>
        v.toLowerCase().includes(needle),
      ),
    );
  }, [farmers, q]);

  async function act(key: string, fn: () => Promise<unknown>, ok: string) {
    setBusy(key);
    try {
      await fn();
      toast.success(ok);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Landmark className="size-5" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold">{t.official.dashTitle}</p>
              <p className="text-xs text-muted-foreground">
                {myOfficial?.name} · {myOfficial?.designation}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LangThemeControls solid />
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await signOut();
                navigate("/");
              }}
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">{t.official.signOut}</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* view tabs */}
        <div className="mb-6 flex gap-1 rounded-lg bg-muted p-1">
          {(
            [
              ["overview", t.official.overview, Users],
              ["farmers", t.official.farmers, BadgeCheck],
              ["payments", t.official.payments, Wallet],
            ] as const
          ).map(([key, label, Icon]) => (
            <button
              key={key}
              type="button"
              onClick={() => setView(key)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors sm:flex-none sm:px-5 ${
                view === key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>

        {view === "overview" && (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              {t.official.welcome}, {myOfficial?.name} — {myOfficial?.department}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat icon={Users} label={t.official.totalFarmers} value={overview?.totalFarmers ?? "—"} />
              <Stat icon={BadgeCheck} label={t.official.verified} value={overview?.verified ?? "—"} />
              <Stat icon={CalendarClock} label={t.official.pendingVerify} value={overview?.pendingVerification ?? "—"} />
              <Stat icon={XCircle} label={t.official.rejected} value={overview?.rejected ?? "—"} />
              <Stat icon={CalendarClock} label={t.official.activeBookings} value={overview?.activeBookings ?? "—"} />
              <Stat icon={Wallet} label={t.official.paidTotal} value={overview ? inr(overview.totalPaid) : "—"} />
              <Stat icon={Wallet} label={t.official.pendingTotal} value={overview ? inr(overview.totalPending) : "—"} />
              <Stat icon={Wallet} label={t.official.pendingTx} value={overview?.pendingTxCount ?? "—"} />
            </div>
          </div>
        )}

        {view === "farmers" && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t.official.searchPh}
                className="pl-9"
              />
            </div>
            <Card className="overflow-hidden border-border/70">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-4 py-3 font-medium">{t.official.farmer}</th>
                      <th className="hidden px-4 py-3 font-medium sm:table-cell">{t.official.village}</th>
                      <th className="hidden px-4 py-3 font-medium md:table-cell">{t.official.land}</th>
                      <th className="hidden px-4 py-3 font-medium md:table-cell">{t.official.docs}</th>
                      <th className="px-4 py-3 font-medium">{t.official.status}</th>
                      <th className="px-4 py-3 text-right font-medium">{t.official.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((f) => (
                      <tr key={f._id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <p className="font-medium">{f.name}</p>
                          <p className="text-xs text-muted-foreground">{f.phone}</p>
                        </td>
                        <td className="hidden px-4 py-3 sm:table-cell">
                          {f.village}
                          <span className="block text-xs text-muted-foreground">{f.district}</span>
                        </td>
                        <td className="hidden px-4 py-3 md:table-cell">{f.landSizeAcres}</td>
                        <td className="hidden px-4 py-3 md:table-cell">{f.docsCount}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={f.verificationStatus} t={t} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1.5">
                            {f.verificationStatus !== "verified" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 border-emerald-500/40 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400"
                                disabled={busy === f._id}
                                onClick={() =>
                                  act(
                                    f._id,
                                    () =>
                                      setVerificationStatus({
                                        farmerId: f._id,
                                        status: "verified",
                                      }),
                                    t.official.verified,
                                  )
                                }
                              >
                                <BadgeCheck className="size-3.5" />
                              </Button>
                            )}
                            {f.verificationStatus !== "rejected" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 border-red-500/40 text-red-700 hover:bg-red-500/10 dark:text-red-400"
                                disabled={busy === f._id}
                                onClick={() =>
                                  act(
                                    f._id,
                                    () =>
                                      setVerificationStatus({
                                        farmerId: f._id,
                                        status: "rejected",
                                      }),
                                    t.official.rejected,
                                  )
                                }
                              >
                                <XCircle className="size-3.5" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                          {t.official.noFarmers}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {view === "payments" && (
          <div className="space-y-4">
            {(pendingTx ?? []).map((tx) => (
              <Card key={tx._id} className="border-border/70">
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-medium">{tx.farmerName} <span className="text-xs font-normal text-muted-foreground">· {tx.village}</span></p>
                    <p className="text-xs text-muted-foreground">
                      {tx.crop} · {tx.quantityQuintal} q · {tx.reference}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-bold">{inr(tx.amount)}</p>
                    <Button
                      size="sm"
                      disabled={busy === tx._id}
                      onClick={() =>
                        act(tx._id, () => markTransactionPaid({ transactionId: tx._id }), t.official.paid)
                      }
                    >
                      {busy === tx._id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        t.official.markPaid
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {pendingTx !== undefined && pendingTx.length === 0 && (
              <Card className="border-border/70">
                <CardContent className="p-10 text-center text-sm text-muted-foreground">
                  <Wallet className="mx-auto size-8" />
                  <p className="mt-3">{t.official.none}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function OfficialApp() {
  return (
    <RequireAuth>
      <RequireOfficial>
        <OfficialAppInner />
      </RequireOfficial>
    </RequireAuth>
  );
}
