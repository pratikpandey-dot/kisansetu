import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useApp } from "@/lib/i18n";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, MapPin, Ticket } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router";

function startOfDay(offset: number): number {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export default function BookSlotPage() {
  const { t, lang } = useApp();
  const farmer = useQuery(api.farmers.getMyFarmer);
  const booking = useQuery(api.bookings.getMyBooking);
  const [dayOffset, setDayOffset] = useState(0);
  const day = useMemo(() => startOfDay(dayOffset), [dayOffset]);
  const slots = useQuery(api.procurement.getSlots, { day });
  const ensureSeed = useMutation(api.farmers.ensureSeed);
  const seedSlots = useMutation(api.dashboard.seedSlotsForDay);

  const [selected, setSelected] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const bookMutation = useMutation(api.bookings.bookSlot);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    ensureSeed();
  }, [ensureSeed]);

  useEffect(() => {
    if (day !== undefined) seedSlots({ day });
  }, [day, seedSlots]);

  const verified = farmer?.verificationStatus === "verified";
  const hasActive = !!booking?.active;

  const days = [0, 1, 2, 3, 4, 5, 6].map((offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return {
      offset,
      label:
        offset === 0
          ? t.booking.today
          : offset === 1
            ? t.booking.tomorrow
            : d.toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
              }),
    };
  });

  const centerNames = useMemo(() => {
    const set = new Set<string>();
    (slots ?? []).forEach((s) => set.add(s.centerName));
    return Array.from(set);
  }, [slots]);

  const [centerFilter, setCenterFilter] = useState<string>("all");

  const filtered = (slots ?? []).filter(
    (s) => centerFilter === "all" || s.centerName === centerFilter,
  );

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const s of filtered) {
      const arr = map.get(s.centerName) ?? [];
      arr.push(s);
      map.set(s.centerName, arr);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const selectedSlot = slots?.find((s) => s._id === selected);

  const canBook =
    verified && !hasActive && farmer !== undefined && farmer !== null;

  const confirm = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await bookMutation({
        slotId: selected as Parameters<typeof bookMutation>[0]["slotId"],
      });
      toast.success(`${t.booking.bookedToast}: ${res.token}`);
      setSelected(null);
      setConfirming(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t.booking.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t.booking.subtitle}
        </p>
      </div>

      {!verified && farmer && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="py-4 text-sm text-amber-700 dark:text-amber-400">
            {t.booking.needVerification}{" "}
            <Link to="/dashboard/documents" className="font-semibold underline">
              {t.nav.documents}
            </Link>
          </CardContent>
        </Card>
      )}
      {!farmer && (
        <Card className="border-dashed">
          <CardContent className="py-4 text-sm text-muted-foreground">
            {t.home.notRegistered}{" "}
            <Link to="/dashboard/register" className="font-semibold underline">
              {t.home.registerNow}
            </Link>
          </CardContent>
        </Card>
      )}
      {hasActive && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex items-center justify-between py-4 text-sm">
            <span>{t.booking.alreadyBooked}</span>
            <Button asChild size="sm" variant="outline">
              <Link to="/dashboard/queue">{t.nav.queue}</Link>
            </Button>
        </CardContent>
        </Card>
      )}

      {/* day selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {days.map((d) => (
          <button
            key={d.offset}
            onClick={() => setDayOffset(d.offset)}
            className={`shrink-0 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
              dayOffset === d.offset
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-card hover:bg-accent"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* centre filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCenterFilter("all")}
          className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            centerFilter === "all"
              ? "border-primary bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-accent"
          }`}
        >
          {t.common.viewAll}
        </button>
        {centerNames.map((name) => (
          <button
            key={name}
            onClick={() => setCenterFilter(name)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              centerFilter === name
                ? "border-primary bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {/* slots */}
      {slots === undefined && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      )}

      {slots !== undefined && grouped.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            {lang === "hi"
              ? "इस दिन के लिए कोई स्लॉट नहीं मिला।"
              : "No slots available for this day."}
          </CardContent>
        </Card>
      )}

      <div className="space-y-8">
        {grouped.map(([centerName, centerSlots]) => (
          <div key={centerName}>
            <h2 className="mb-3 flex items-center gap-2 font-semibold">
              <MapPin className="size-4 text-primary" />
              {centerName}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {centerSlots.map((s) => {
                const full = s.booked >= s.capacity;
                const pct = Math.round((s.booked / s.capacity) * 100);
                return (
                  <Card
                    key={s._id}
                    className={`transition-all ${
                      selected === s._id
                        ? "border-primary ring-2 ring-primary/30"
                        : "hover:border-primary/40"
                    } ${full ? "opacity-60" : ""}`}
                  >
                    <CardContent className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold">{s.label}</span>
                        {full ? (
                          <Badge variant="destructive">{t.booking.full}</Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                          >
                            {s.capacity - s.booked} left
                          </Badge>
                        )}
                      </div>
                      <div>
                        <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                          <span>
                            {s.booked}/{s.capacity} {t.booking.capacity}
                          </span>
                          <span>{pct}%</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="w-full"
                        disabled={full || !canBook}
                        onClick={() => {
                          setSelected(s._id);
                          setConfirming(true);
                        }}
                      >
                        {t.booking.book}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* confirm dialog */}
      <Dialog open={confirming} onOpenChange={setConfirming}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t.booking.confirmTitle}</DialogTitle>
            <DialogDescription>{t.booking.confirmBody}</DialogDescription>
          </DialogHeader>
          {selectedSlot && (
            <div className="space-y-2 rounded-xl border bg-muted/40 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.booking.center}</span>
                <span className="font-medium text-right">
                  {selectedSlot.centerName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t.booking.slot}
                </span>
                <span className="font-medium">{selectedSlot.label}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirming(false)}
              disabled={saving}
            >
              {t.booking.cancel}
            </Button>
            <Button
              onClick={confirm}
              disabled={saving || !selected}
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Ticket className="size-4" />
              )}
              {t.booking.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
