import { useQuery } from "convex/react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  BadgeCheck,
  Clock3,
  Mail,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import { Link } from "react-router";

export default function ProfilePage() {
  const { t, lang } = useApp();
  const { user } = useAuth();
  const farmer = useQuery(api.farmers.getMyFarmer);

  const verified = farmer?.verificationStatus === "verified";
  const displayName =
    farmer?.name || user?.name || user?.email?.split("@")[0] || "Farmer";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t.profile.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t.profile.subtitle}
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-start gap-5 py-6 sm:flex-row sm:items-center">
          <Avatar className="size-16">
            <AvatarFallback className="bg-primary/15 text-xl font-bold text-primary">
              {displayName.slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <CardTitle className="flex flex-wrap items-center gap-2 text-xl">
              {displayName}
              {verified && (
                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                  <BadgeCheck className="mr-1 size-3.5" />
                  {t.home.verified}
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-0.5 flex items-center gap-1.5">
              <Mail className="size-3.5" />
              {user?.email}
            </CardDescription>
          </div>
          <Button asChild variant="outline">
            <Link to="/dashboard/register">{t.register.editProfile}</Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="size-4 text-primary" />
              {t.profile.personal}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {farmer ? (
              <>
                {[
                  { icon: User, label: t.register.name, value: farmer.name },
                  {
                    icon: Phone,
                    label: t.register.phone,
                    value: farmer.phone,
                  },
                  {
                    icon: User,
                    label: t.register.village,
                    value: farmer.village,
                  },
                  {
                    icon: User,
                    label: t.register.district,
                    value: farmer.district,
                  },
                  {
                    icon: User,
                    label: t.register.state,
                    value: farmer.state,
                  },
                  {
                    icon: User,
                    label: t.register.land,
                    value: `${farmer.landSizeAcres} ${lang === "hi" ? "एकड़" : "acres"}`,
                  },
                ].map((row) => (
                  <div key={row.label} className="flex items-center gap-3 text-sm">
                    <row.icon className="size-4 shrink-0 text-muted-foreground" />
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="ml-auto font-medium">{row.value}</span>
                  </div>
                ))}
              </>
            ) : (
              <div className="flex flex-col items-start gap-3 py-4">
                <p className="text-sm text-muted-foreground">
                  {t.profile.notRegistered}
                </p>
                <Button asChild size="sm">
                  <Link to="/dashboard/register">{t.home.registerNow}</Link>
                </Button>
              </div>
            )}
            {farmer && (
              <>
                <Separator className="my-2" />
                <div className="flex items-center gap-3 text-sm">
                  <Clock3 className="size-4 shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {t.profile.member}
                  </span>
                  <span className="ml-auto font-medium">
                    {new Date(farmer.createdAt).toLocaleDateString(
                      lang === "hi" ? "hi-IN" : "en-IN",
                      { day: "numeric", month: "short", year: "numeric" },
                    )}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className={verified ? "border-emerald-500/30" : "border-amber-500/30"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="size-4 text-primary" />
              {t.profile.verification}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`rounded-xl p-4 ${
                verified
                  ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
                  : "bg-amber-500/10 text-amber-800 dark:text-amber-300"
              }`}
            >
              <p className="font-semibold">
                {verified ? t.home.verified : t.home.verificationPending}
              </p>
              <p className="mt-1 text-sm opacity-80">
                {verified
                  ? t.home.verifiedBody
                  : t.home.verificationPendingBody}
              </p>
            </div>
            <Button asChild variant="outline" className="mt-4 w-full">
              <Link to="/dashboard/documents">{t.nav.documents}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
