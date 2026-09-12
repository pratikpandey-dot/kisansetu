import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useApp } from "@/lib/i18n";
import { LangThemeControls } from "@/components/LangThemeControls";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import logo from "@/assets/logo.svg";
import {
  ArrowRight,
  BadgeCheck,
  ChevronLeft,
  Landmark,
  Loader2,
  Mail,
  ShieldCheck,
  UserX,
  Wheat,
} from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirectAfterAuth(
  returnTo: string | null,
  fallback = "/dashboard",
) {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return fallback;
}

const DEMO_OFFICIALS = [
  { email: "official@kisan.gov.in", code: "JH-AGRI-7788" },
  { email: "verification.cell@kisan.gov.in", code: "UP-AGRI-3344" },
];

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const { t, lang } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(
    searchParams.get("returnTo"),
    redirectAfterAuth,
  );
  const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"farmer" | "official">(() =>
    new URLSearchParams(window.location.search).get("tab") === "official"
      ? "official"
      : "farmer",
  );
  const [officialEmail, setOfficialEmail] = useState("");
  const [officialCode, setOfficialCode] = useState("");
  const verifyOfficial = useMutation(api.officials.verifyAccessCode);
  const seedOfficials = useMutation(api.officialsSeed.ensureOfficialsSeed);

  useEffect(() => {
    seedOfficials().catch(() => {});
  }, [seedOfficials]);

  useEffect(() => {
    // Officials are redirected by handleOfficialOtpSubmit after the access
    // code is verified — skip the auto-redirect for them.
    if (!authLoading && isAuthenticated && tab === "farmer") {
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, navigate, redirect, tab]);

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      setStep({ email: formData.get("email") as string });
    } catch (error) {
      console.error("Email sign-in error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to send verification code. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      navigate(redirect);
    } catch (error) {
      console.error("OTP verification error:", error);
      setError(
        lang === "hi"
          ? "आपका दर्ज कोड गलत है।"
          : "The verification code you entered is incorrect.",
      );
      setOtp("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
      navigate(redirect);
    } catch (error) {
      console.error("Guest login error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to sign in as guest",
      );
      setIsLoading(false);
    }
  };

  const handleOfficialSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      // Officials sign in with the same email-OTP flow; the access code is
      // verified right after the user is authenticated.
      const formData = new FormData(event.currentTarget);
      const email = String(formData.get("email") ?? "").trim();
      await signIn("email-otp", formData);
      setOfficialEmail(email);
      setStep({ email });
    } catch (error) {
      console.error("Official email sign-in error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to send verification code. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOfficialOtpSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      const res = await verifyOfficial({
        email: officialEmail,
        accessCode: officialCode,
      });
      if (!res.ok) {
        setError(
          res.reason === "not_found"
            ? t.official.notFound
            : t.official.badCode,
        );
        setOtp("");
        setIsLoading(false);
        return;
      }
      toast.success(t.official.dashTitle);
      navigate("/official", { replace: true });
    } catch (error) {
      console.error("Official OTP verification error:", error);
      setError(t.official.generic);
      setOtp("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* top bar */}
      <header className="border-b bg-card/60 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="Kisan Setu" className="size-9 rounded-lg" />
            <span className="text-base font-bold">{t.brand}</span>
          </Link>
          <LangThemeControls solid />
        </div>
      </header>

      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2">
        {/* left: pitch */}
        <div className="order-2 hidden lg:order-1 lg:block">
          <h2 className="text-3xl font-bold tracking-tight">
            {t.auth.title}
          </h2>
          <p className="mt-3 max-w-md text-muted-foreground">
            {t.landing.heroSub}
          </p>
          <ul className="mt-8 space-y-4">
            {[
              { icon: ShieldCheck, text: t.landing.feature1Title },
              { icon: Wheat, text: t.landing.feature2Title },
            ].map((item) => (
              <li key={item.text} className="flex items-start gap-3">                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <item.icon className="size-4" />
                  </div>
                <span className="pt-1.5 text-sm font-medium">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* right: card */}
        <div className="order-1 flex items-center justify-center lg:order-2">
          <Card className="w-full max-w-md border-border/70 shadow-xl shadow-primary/5">
            {step === "signIn" ? (
              <>
                <CardHeader className="text-center">
                  <div className="mx-auto flex justify-center">
                    <img
                      src={logo}
                      alt="Kisan Setu"
                      width={64}
                      height={64}
                      className="rounded-xl"
                    />
                  </div>
                  <CardTitle className="mt-4 text-xl">{t.auth.title}</CardTitle>
                  <CardDescription>{t.auth.subtitle}</CardDescription>
                  {/* role tabs */}
                  <div className="mt-4 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
                    <button
                      type="button"
                      onClick={() => {
                        setTab("farmer");
                        setError(null);
                      }}
                      className={`flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                        tab === "farmer"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Wheat className="size-4" />
                      {t.official.farmerTab}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTab("official");
                        setError(null);
                      }}
                      className={`flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                        tab === "official"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Landmark className="size-4" />
                      {t.official.tab}
                    </button>
                  </div>
                </CardHeader>
                {tab === "farmer" ? (
                  <form onSubmit={handleEmailSubmit}>
                    <CardContent className="space-y-4">
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          name="email"
                          placeholder="name@example.com"
                          type="email"
                          className="pl-9"
                          disabled={isLoading}
                          required
                        />
                      </div>
                      {error && (
                        <p className="text-sm text-destructive">{error}</p>
                      )}
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <>
                            {t.auth.sendCode}
                            <ArrowRight className="size-4" />
                          </>
                        )}
                      </Button>
                      <div className="relative py-1">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center">
                          <span className="bg-card px-2 text-xs uppercase text-muted-foreground">
                            {t.auth.or}
                          </span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={handleGuestLogin}
                        disabled={isLoading}
                      >
                        <UserX className="size-4" />
                        {t.auth.guest}
                      </Button>
                    </CardContent>
                  </form>
                ) : (
                  <form onSubmit={handleOfficialSubmit}>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5 text-xs text-muted-foreground">
                        <BadgeCheck className="size-4 shrink-0 text-primary" />
                        {t.official.subtitle}
                      </div>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          name="email"
                          placeholder="official@kisan.gov.in"
                          type="email"
                          className="pl-9"
                          disabled={isLoading}
                          required
                        />
                      </div>
                      <div className="relative">
                        <ShieldCheck className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          value={officialCode}
                          onChange={(e) => setOfficialCode(e.target.value)}
                          placeholder={t.official.codePlaceholder}
                          className="pl-9"
                          disabled={isLoading}
                          required
                        />
                      </div>
                      {error && (
                        <p className="text-sm text-destructive">{error}</p>
                      )}
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <>
                            {t.auth.sendCode}
                            <ArrowRight className="size-4" />
                          </>
                        )}
                      </Button>
                      <div className="rounded-lg bg-muted/60 px-3 py-2.5 text-xs text-muted-foreground">
                        <p className="font-medium">{t.official.demoTitle}</p>
                        {DEMO_OFFICIALS.map((d) => (
                          <p key={d.email} className="mt-1 font-mono">
                            {d.email} · {d.code}
                          </p>
                        ))}
                      </div>
                    </CardContent>
                  </form>
                )}
              </>
            ) : (
              <>
                <CardHeader className="text-center">
                  <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Mail className="size-5" />
                  </div>
                  <CardTitle className="mt-3 text-xl">
                    {t.auth.codeSent}
                  </CardTitle>
                  <CardDescription>{step.email}</CardDescription>
                </CardHeader>
                <form
                  onSubmit={
                    tab === "official" ? handleOfficialOtpSubmit : handleOtpSubmit
                  }
                >
                  <CardContent className="space-y-4">
                    <input type="hidden" name="email" value={step.email} />
                    <input type="hidden" name="code" value={otp} />
                    <div className="flex justify-center">
                      <InputOTP
                        value={otp}
                        onChange={setOtp}
                        maxLength={6}
                        disabled={isLoading}
                        onKeyDown={(e) => {
                          if (
                            e.key === "Enter" &&
                            otp.length === 6 &&
                            !isLoading
                          ) {
                            const form = (e.target as HTMLElement).closest(
                              "form",
                            );
                            form?.requestSubmit();
                          }
                        }}
                      >
                        <InputOTPGroup>
                          {Array.from({ length: 6 }).map((_, index) => (
                            <InputOTPSlot key={index} index={index} />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    {error && (
                      <p className="text-center text-sm text-destructive">
                        {error}
                      </p>
                    )}
                    <p className="text-center text-sm text-muted-foreground">
                      {t.auth.tryAgain}{" "}
                      <Button
                        variant="link"
                        className="h-auto p-0"
                        onClick={() => setStep("signIn")}
                      >
                        ↺
                      </Button>
                    </p>
                  </CardContent>
                  <CardFooter className="flex-col gap-2">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading || otp.length !== 6}
                    >
                      {isLoading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <>
                          {tab === "official" ? t.official.signIn : t.auth.verify}
                          <ArrowRight className="size-4" />
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setStep("signIn")}
                      disabled={isLoading}
                      className="w-full"
                    >
                      <ChevronLeft className="size-4" />
                      {t.auth.changeEmail}
                    </Button>
                  </CardFooter>
                </form>
              </>
            )}
            <div className="rounded-b-xl border-t bg-muted/50 px-6 py-3.5 text-center text-xs text-muted-foreground">
              {t.auth.secured}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
