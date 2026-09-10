import { useState } from "react";
import { useApp } from "@/lib/i18n";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Mail, MapPin, Phone, Star } from "lucide-react";

export default function SupportPage() {
  const { t } = useApp();
  const [rating, setRating] = useState(0);
  const [rated, setRated] = useState(false);

  const submitRating = (value: number) => {
    setRating(value);
    setRated(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t.support.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t.support.subtitle}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md">
          <CardHeader>
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Phone className="size-5" />
            </div>
            <CardTitle className="text-base">{t.support.helpline}</CardTitle>
            <CardDescription className="text-sm font-semibold text-foreground">
              1800-180-1551
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {t.support.hours}
          </CardContent>
        </Card>
        <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md">
          <CardHeader>
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Mail className="size-5" />
            </div>
            <CardTitle className="text-base">{t.support.email}</CardTitle>
            <CardDescription className="text-sm font-semibold text-foreground">
              help@kisansetu.in
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {t.support.hours}
          </CardContent>
        </Card>
        <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md">
          <CardHeader>
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MapPin className="size-5" />
            </div>
            <CardTitle className="text-base">{t.support.office}</CardTitle>
            <CardDescription className="text-sm font-semibold text-foreground">
              {t.support.officeAddr}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {t.support.hours}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t.support.faq}</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              {[
                { q: t.support.faq1, a: t.support.faq1Body },
                { q: t.support.faq2, a: t.support.faq2Body },
                { q: t.support.faq3, a: t.support.faq3Body },
              ].map((f) => (
                <AccordionItem key={f.q} value={f.q}>
                  <AccordionTrigger className="text-sm">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-chart-2/10">
          <CardHeader>
            <CardTitle className="text-base">{t.support.rate}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 py-6">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => submitRating(n)}
                  className="transition-transform hover:scale-125"
                  aria-label={`${n} star`}
                >
                  <Star
                    className={`size-9 ${
                      n <= rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/40"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rated && (
              <p className="text-sm font-medium text-primary">
                {t.support.rateThanks}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
