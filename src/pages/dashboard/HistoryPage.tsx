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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Receipt } from "lucide-react";

export default function HistoryPage() {
  const { t } = useApp();
  const txs = useQuery(api.dashboard.getMyTransactions);

  const paid = (txs ?? [])
    .filter((x) => x.status === "paid")
    .reduce((s, x) => s + x.amount, 0);
  const pending = (txs ?? [])
    .filter((x) => x.status === "pending")
    .reduce((s, x) => s + x.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t.history.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t.history.subtitle}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center justify-between py-5">
            <div>
              <CardDescription>{t.history.total}</CardDescription>
              <CardTitle className="mt-1 text-2xl text-emerald-600 dark:text-emerald-400">
                ₹{paid.toLocaleString("en-IN")}
              </CardTitle>
            </div>
            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
              {t.history.paid}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between py-5">
            <div>
              <CardDescription>{t.history.totalPending}</CardDescription>
              <CardTitle className="mt-1 text-2xl text-amber-600 dark:text-amber-400">
                ₹{pending.toLocaleString("en-IN")}
              </CardTitle>
            </div>
            <Badge variant="secondary">{t.history.pending}</Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Receipt className="size-4 text-primary" />
            {t.history.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {txs === undefined ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : txs.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {t.history.empty}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.history.ref}</TableHead>
                    <TableHead>{t.history.crop}</TableHead>
                    <TableHead className="text-right">{t.history.qty}</TableHead>
                    <TableHead className="text-right">{t.history.rate}</TableHead>
                    <TableHead className="text-right">{t.history.amount}</TableHead>
                    <TableHead className="text-right">{t.history.status}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {txs.map((tx) => (
                    <TableRow key={tx._id}>
                      <TableCell className="font-mono text-xs">
                        {tx.reference}
                      </TableCell>
                      <TableCell className="font-medium">{tx.crop}</TableCell>
                      <TableCell className="text-right">
                        {tx.quantityQuintal}
                      </TableCell>
                      <TableCell className="text-right">
                        ₹{tx.ratePerQuintal.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ₹{tx.amount.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right">
                        {tx.status === "paid" ? (
                          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                            {t.history.paid}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">{t.history.pending}</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
