import { useApp } from "@/lib/i18n";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  FileCheck2,
  Gavel,
  IndianRupee,
  Phone,
  Scale,
  Tractor,
  Truck,
} from "lucide-react";

export default function AboutPage() {
  const { t } = useApp();

  const steps = [
    { icon: Tractor, title: t.landing.how1, body: t.landing.how1Body },
    { icon: FileCheck2, title: t.landing.how2, body: t.landing.how2Body },
    { icon: Scale, title: t.landing.how3, body: t.landing.how3Body },
    { icon: IndianRupee, title: t.landing.how4, body: t.landing.how4Body },
  ];

  const rules = [
    t.support.faq1Body,
    t.support.faq2Body,
    t.support.faq3Body,
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t.nav.about}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          {t.settings.aboutBody}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <Card key={s.title}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <s.icon className="size-5" />
                </div>
                <span className="text-2xl font-extrabold text-muted-foreground/25">
                  {i + 1}
                </span>
              </div>
              <CardTitle className="text-base">{s.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">{s.body}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Gavel className="size-4 text-primary" />
              {t.nav.about} · {t.prices.title}
            </CardTitle>
            <CardDescription>
              {lang === "hi"
                ? "बेचने से पहले ये बातें जान लें"
                : "Know this before you sell"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {rules.map((r) => (
              <div key={r} className="flex items-start gap-2.5 text-sm">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                <span className="text-muted-foreground">{r}</span>
              </div>
            ))}
            <Separator className="my-3" />
            <div className="flex items-start gap-2.5 text-sm">
              <Truck className="mt-0.5 size-4 shrink-0 text-primary" />
              <span className="text-muted-foreground">
                {lang === "hi"
                  ? "फ़सल केंद्र पर तौली जाती है और उसी वजन पर भुगतान होता है।"
                  : "Your produce is weighed at the centre and paid on that weight."}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Phone className="size-4 text-primary" />
              {t.support.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">{t.support.helpline}: </span>
              <strong>1800-180-1551</strong>
            </p>
            <p>
              <span className="text-muted-foreground">{t.support.email}: </span>
              <strong>help@kisansetu.in</strong>
            </p>
            <p>
              <span className="text-muted-foreground">{t.support.office}: </span>
              <strong>{t.support.officeAddr}</strong>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
