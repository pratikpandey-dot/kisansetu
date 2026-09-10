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
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Bell,
  Clock,
  History,
  MapPin,
  Ticket,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router";
import { useState } from "react";

export default function QueuePage() {
  const { t, lang } = useApp();
  const booking = useQuery(api.bookings.getMyBooking);
  const cancel = useMutation(api.bookings.cancelBooking);
  const [cancelling, setCancelling] = useState(false);

  const active = booking?.active ?? null;

  const handleCancel = async () => {
    if (!active) return;
    setCancelling(true);
    try {
      await cancel({ bookingId: active.booking._id });
      toast.success(t.queue.cancelledToast);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setCancelling(false);
    }
  };

  const fmtDay = (ms: number) =>
    new Date(ms).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t.queue.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t.queue.subtitle}
        </p>
      </div>

      {booking === undefined && (
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      )}

      {booking !== undefined && booking !== null && !active && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
              <Ticket className="size-7 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">{t.queue.noneActive}</CardTitle>
              <CardDescription className="mt-1">
                {t.queue.noneActiveBody}
              </CardDescription>
            </div>
            <Button asChild>
              <Link to="/dashboard/book">{t.queue.bookNow}</Link>
            </Button>
            {/* history */}
            {booking && booking.history.length > 0 && (
              <div className="w-full max-w-md pt-4 text-left">
                <Separator className="mb-4" />
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <History className="size-4" />
                  {t.queue.history}
                </h3>
                <div className="space-y-2">
                  {booking.history.map((b) => (
                    <div
                      key={b._id}
                      className="flex items-center justify-between rounded-lg border p-3 text-sm"
                    >
                      <span className="font-mono text-xs">{b.queueToken}</span>
                      <Badge
                        variant={
                          b.status === "completed" ? "default" : "secondary"
                        }
                      >
                        {b.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {active && active.slot && (
        <>
          <Card className="overflow-hidden border-primary/30">
            <div className="bg-primary px-6 py-4 text-primary-foreground">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <Ticket className="size-4" />
                  {t.queue.token}: {active.booking.queueToken}
                </span>
                <Badge
                  variant="outline"
                  className="animate-pulse border-primary-foreground/40 text-primary-foreground"
                >
                  <Bell className="mr-1 size-3" />
                  LIVE
                </Badge>
              </div>
            </div>
            <CardContent className="grid gap-6 py-6 sm:grid-cols-3">
              <div className="text-center sm:text-left">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t.queue.yourPosition}
                </p>
                <p className="mt-1 text-5xl font-extrabold text-primary">
                  {active.position}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {active.totalInQueue} {t.home.inQueue}
                </p>
              </div>
              <div className="sm:col-span-2 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border p-4">
                  <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <Users className="size-3.5" />
                    {t.queue.peopleAhead}
                  </p>
                  <p className="mt-1 text-2xl font-bold">
                    {active.position - 1}
                  </p>
                </div>
                <div className="rounded-xl border p-4">
                  <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <Users className="size-3.5" />
                    {t.queue.total}
                  </p>
                  <p className="mt-1 text-2xl font-bold">
                    {active.totalInQueue}
                  </p>
                </div>
                <div className="rounded-xl border p-4">
                  <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <Clock className="size-3.5" />
                    {t.queue.slotLabel}
                  </p>
                  <p className="mt-1 font-semibold">{active.slot.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {fmtDay(active.slot.day)}
                  </p>
                </div>
                <div className="rounded-xl border p-4">
                  <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <MapPin className="size-3.5" />
                    {t.queue.center}
                  </p>
                  <p className="mt-1 truncate font-semibold">
                    {active.centerName}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={
              active.position === 1
                ? "border-emerald-500/30 bg-emerald-500/5"
                : "border-blue-500/30 bg-blue-500/5"
            }
          >
            <CardContent className="flex items-start gap-3 py-4">
              <Bell className="mt-0.5 size-4 shrink-0 text-primary" />
              <p className="text-sm">
                {active.position === 1 ? t.queue.active : t.queue.waiting}
              </p>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-destructive">
                  {t.queue.cancelBooking}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t.queue.cancelBooking}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t.booking.confirmBody}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="bg-destructive text-white hover:bg-destructive/90"
                  >
                    {t.common.cancel}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </>
      )}
    </div>
  );
}
