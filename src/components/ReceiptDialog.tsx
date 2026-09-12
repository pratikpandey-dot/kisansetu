import { useState } from "react";
import { toast } from "sonner";
import { snapdom } from "@zumer/snapdom";
import { useApp } from "@/lib/i18n";
import { LANGS } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Download, Loader2, Printer, ReceiptText } from "lucide-react";
import logo from "@/assets/logo.svg";

export interface ReceiptTx {
  _id: string;
  crop: string;
  quantityQuintal: number;
  ratePerQuintal: number;
  amount: number;
  status: string;
  reference: string;
  createdAt: number;
}

export function ReceiptDialog({
  tx,
  farmerName,
  open,
  onOpenChange,
}: {
  tx: ReceiptTx | null;
  farmerName: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { t, lang } = useApp();
  const { user } = useAuth();
  const [busy, setBusy] = useState<"print" | "download" | null>(null);

  if (!tx) return null;

  const locale = LANGS.find((l) => l.code === lang)?.locale ?? "en-IN";
  const fmtDate = (ms: number) =>
    new Date(ms).toLocaleDateString(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  const fmtTime = (ms: number) =>
    new Date(ms).toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
    });

  const captureNode = () =>
    document.getElementById("kisan-receipt") as HTMLElement | null;

  const handleDownload = async () => {
    const node = captureNode();
    if (!node) return;
    setBusy("download");
    try {
      await snapdom.download(node, {
        format: "png",
        filename: `kisan-setu-receipt-${tx.reference}`,
        scale: 2,
      });
      toast.success(t.receipt.download + " ✓");
    } catch {
      toast.error(t.chat.error);
    } finally {
      setBusy(null);
    }
  };

  const handlePrint = () => {
    setBusy("print");
    window.print();
    setTimeout(() => setBusy(null), 500);
  };

  const paid = tx.status === "paid";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <div className="max-h-[80vh] overflow-y-auto">
          {/* ---------- the receipt (captured for PNG / print) ---------- */}
          <div
            id="kisan-receipt"
            className="receipt-print bg-white text-neutral-900 px-6 py-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img src={logo} alt="" className="size-10 rounded-lg" />
                <div className="leading-tight">
                  <div className="text-base font-bold">किसान सेतु · Kisan Setu</div>
                  <div className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                    {t.receipt.header}
                  </div>
                </div>
              </div>
              <Badge
                className={
                  paid
                    ? "bg-emerald-600 text-white"
                    : "bg-amber-500 text-white"
                }
              >
                {paid ? t.history.paid : t.history.pending}
              </Badge>
            </div>

            <div className="my-4 border-t-2 border-dashed border-neutral-300" />

            <dl className="space-y-2.5 text-sm">
              <Row label={t.receipt.ref} value={tx.reference} mono />
              <Row label={t.receipt.farmer} value={farmerName || user?.email || "—"} />
              <Row label={t.history.crop} value={tx.crop} />
              <Row label={t.history.qty} value={`${tx.quantityQuintal} q`} />
              <Row
                label={t.history.rate}
                value={`₹${tx.ratePerQuintal.toLocaleString("en-IN")}`}
              />
              <Row label={t.receipt.issued} value={`${fmtDate(tx.createdAt)} · ${fmtTime(tx.createdAt)}`} />
            </dl>

            <div className="my-4 border-t-2 border-dashed border-neutral-300" />

            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
                {t.history.amount}
              </span>
              <span className="text-3xl font-extrabold">
                ₹{tx.amount.toLocaleString("en-IN")}
              </span>
            </div>

            <p className="mt-4 rounded-lg bg-neutral-100 px-3 py-2 text-center text-[11px] font-medium text-neutral-600">
              {t.receipt.paidVia}
            </p>
            <p className="mt-3 text-center text-[10px] leading-relaxed text-neutral-500">
              {t.receipt.footer}
              <br />
              {t.receipt.support}
            </p>
          </div>

          {/* ---------- actions ---------- */}
          <div className="border-t bg-muted/50 px-6 py-4">
            <DialogHeader className="sr-only">
              <DialogTitle>{t.receipt.title}</DialogTitle>
              <DialogDescription>{tx.reference}</DialogDescription>
            </DialogHeader>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handlePrint}
                disabled={busy !== null}
              >
                {busy === "print" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Printer className="size-4" />
                )}
                {t.receipt.print}
              </Button>
              <Button className="flex-1" onClick={handleDownload} disabled={busy !== null}>
                {busy === "download" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Download className="size-4" />
                )}
                {t.receipt.download}
              </Button>
            </div>
            <p className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
              <ReceiptText className="size-3" />
              {t.receipt.title} · {tx.reference}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="shrink-0 text-neutral-500">{label}</dt>
      <dd className={mono ? "font-mono text-xs font-semibold" : "font-semibold"}>
        {value}
      </dd>
    </div>
  );
}
