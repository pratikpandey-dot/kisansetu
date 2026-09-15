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
import { Badge } from "@/components/ui/badge";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import logo from "@/assets/logo.svg";
import { FarmerScene } from "@/components/FarmerScene";
import {
  ArrowRight,
  BadgeCheck,
  ChevronLeft,
  Landmark,
  Loader2,
  Mail,
  ShieldCheck,
  Sparkles,
  UserX,
  Wheat,
} from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { AnimatePresence, motion } from "framer-motion";

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

const PITCH_ICONS = [ShieldCheck, Wheat, Sparkles];

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

  const pitchItems = [
    t.landing.feature1Title,
    t.landing.feature2Title,
    t.landing.feature4Title,
  ];

  return (
    <div className="from-emerald-950 via-emerald-900 dark:from-emerald-950 dark:via-black dark:to-emerald-950 min-h-screen bg-gradient-to-br to-teal-950">
      {/* top bar */}
      <header className="border-b border-white/10 bg-emerald-950/60 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="group flex items-center gap-2.5">
            <img
              src={logo}
              alt="Kisan Setu"
              className="size-9 rounded-lg transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110"
            />
            <span className="text-base font-bold text-white">{t.brand}</span>
          </Link>
          <LangThemeControls solid />
        </div>
      </header>

      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2">
        {/* ambient glows */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="animate-float-slow absolute -top-32 left-1/4 h-96 w-[560px] rounded-full bg-emerald-500/15 blur-[120px]" />
          <div className="animate-float absolute right-0 bottom-0 h-72 w-96 rounded-full bg-amber-400/10 blur-[100px]" />
        </div>

        {/* left: cinematic pitch + farmer animation */}
        <div className="order-2 text-white lg:order-1 lg:block">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <Badge className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-xs font-semibold text-emerald-200">
              <Sparkles className="mr-1.5 size-3.5" />
              {t.tagline}
            </Badge>
            <h2 className="font-display mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              <span className="text-shimmer bg-clip-text">{t.auth.title}</span>
            </h2>
            <p className="mt-3 max-w-md text-emerald-100/75">
              {t.landing.heroSub}
            </p>
          </motion.div>

          {/* animated farmer scene */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative mx-auto mt-6 max-w-md"
          >
            <FarmerScene />
          </motion.div>

          {/* pitch list */}
          <ul className="mt-6 grid gap-3 sm:grid-cols-3">
            {pitchItems.map((text, i) => {
              const Icon = PITCH_ICONS[i];
              return (
                <motion.li
                  key={text}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.3 + i * 0.1 }}
                  className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur transition-colors hover:border-emerald-300/40"
                >
                  <div className="mb-2 flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-emerald-950 shadow-md shadow-emerald-500/30">
                    <Icon className="size-4" />
                  </div>
                  <span className="block text-xs leading-snug font-medium text-emerald-50/90">
                    {text}
                  </span>
                </motion.li>
              );
            })}
          </ul>
        </div>

        {/* right: card */}
        <div className="order-1 flex items-center justify-center lg:order-2">
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.1 }}
            className="w-full max-w-md"
          >
            <Card className="border-white/15 bg-white/[0.07] shadow-2xl shadow-emerald-950/40 backdrop-blur-xl dark:bg-white/[0.05]">
              {step === "signIn" ? (
                <>
                  <CardHeader className="text-center">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="mx-auto flex justify-center"
                    >
                      <div className="rounded-2xl bg-white/90 p-2 shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-300/40">
                        <img
                          src={logo}
                          alt="Kisan Setu"
                          width={56}
                          height={56}
                          className="size-14 rounded-xl"
                        />
                      </div>
                    </motion.div>
                    <CardTitle className="mt-3 text-xl text-white">
                      {t.auth.title}
                    </CardTitle>
                    <CardDescription className="text-emerald-100/70">
                      {t.auth.subtitle}
                    </CardDescription>
                    {/* role tabs */}
                    <div className="relative mt-4 grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-black/20 p-1">
                      {(
                        [
                          { key: "farmer", icon: Wheat, label: t.official.farmerTab },
                          { key: "official", icon: Landmark, label: t.official.tab },
                        ] as const
                      ).map((r) => (
                        <button
                          key={r.key}
                          type="button"
                          onClick={() => {
                            setTab(r.key);
                            setError(null);
                          }}
                          className={`relative flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                            tab === r.key
                              ? "text-white"
                              : "text-emerald-100/60 hover:text-white"
                          }`}
                        >
                          {tab === r.key && (
                            <motion.span
                              layoutId="auth-tab-pill"
                              className={`absolute inset-0 rounded-lg shadow-md ${
                                r.key === "farmer"
                                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/30"
                                  : "bg-gradient-to-r from-sky-500 to-indigo-500 shadow-sky-500/30"
                              }`}
                              transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                          )}
                          <r.icon className="relative size-4" />
                          <span className="relative">{r.label}</span>
                        </button>
                      ))}
                    </div>
                  </CardHeader>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={tab}
                      initial={{ opacity: 0, x: tab === "farmer" ? -16 : 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: tab === "farmer" ? 16 : -16 }}
                      transition={{ duration: 0.22 }}
                    >
                      {tab === "farmer" ? (
                        <form onSubmit={handleEmailSubmit}>
                          <CardContent className="space-y-4">
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-emerald-200/70" />
                              <Input
                                name="email"
                                placeholder="name@example.com"
                                type="email"
                                className="border-white/15 bg-white/10 pl-9 text-white placeholder:text-emerald-100/40 focus-visible:ring-emerald-400/60"
                                disabled={isLoading}
                                required
                              />
                            </div>
                            {error && (
                              <motion.p
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-sm text-red-300"
                              >
                                {error}
                              </motion.p>
                            )}
                            <Button
                              type="submit"
                              className="animate-gradient-x h-11 w-full rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 font-semibold text-emerald-950 shadow-lg shadow-emerald-500/30"
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
                                <span className="w-full border-t border-white/10" />
                              </div>
                              <div className="relative flex justify-center">
                                <span className="px-2 text-xs uppercase text-emerald-100/50">
                                  {t.auth.or}
                                </span>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              className="h-11 w-full rounded-xl border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
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
                            <div className="flex items-center gap-2 rounded-lg border border-sky-300/25 bg-sky-400/10 px-3 py-2.5 text-xs text-sky-100/90">
                              <BadgeCheck className="size-4 shrink-0 text-sky-300" />
                              {t.official.subtitle}
                            </div>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-emerald-200/70" />
                              <Input
                                name="email"
                                placeholder="official@kisan.gov.in"
                                type="email"
                                className="border-white/15 bg-white/10 pl-9 text-white placeholder:text-emerald-100/40 focus-visible:ring-sky-400/60"
                                disabled={isLoading}
                                required
                              />
                            </div>
                            <div className="relative">
                              <ShieldCheck className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-emerald-200/70" />
                              <Input
                                value={officialCode}
                                onChange={(e) => setOfficialCode(e.target.value)}
                                placeholder={t.official.codePlaceholder}
                                className="border-white/15 bg-white/10 pl-9 text-white placeholder:text-emerald-100/40 focus-visible:ring-sky-400/60"
                                disabled={isLoading}
                                required
                              />
                            </div>
                            {error && (
                              <motion.p
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-sm text-red-300"
                              >
                                {error}
                              </motion.p>
                            )}
                            <Button
                              type="submit"
                              className="animate-gradient-x h-11 w-full rounded-xl bg-gradient-to-r from-sky-500 via-indigo-500 to-sky-500 font-semibold text-white shadow-lg shadow-sky-500/30"
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
                            <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-xs text-emerald-100/70">
                              <p className="font-medium text-emerald-100/90">
                                {t.official.demoTitle}
                              </p>
                              {DEMO_OFFICIALS.map((d) => (
                                <p key={d.email} className="mt-1 font-mono">
                                  {d.email} · {d.code}
                                </p>
                              ))}
                            </div>
                          </CardContent>
                        </form>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </>
              ) : (
                <>
                  <CardHeader className="text-center">
                    <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
                      <Mail className="size-5" />
                    </div>
                    <CardTitle className="mt-3 text-xl text-white">
                      {t.auth.codeSent}
                    </CardTitle>
                    <CardDescription className="text-emerald-100/70">
                      {step.email}
                    </CardDescription>
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
                        <p className="text-center text-sm text-red-300">{error}</p>
                      )}
                      <p className="text-center text-sm text-emerald-100/60">
                        {t.auth.tryAgain}{" "}
                        <Button
                          variant="link"
                          className="h-auto p-0 text-emerald-300"
                          onClick={() => setStep("signIn")}
                        >
                          ↺
                        </Button>
                      </p>
                    </CardContent>
                    <CardFooter className="flex-col gap-2">
                      <Button
                        type="submit"
                        className="animate-gradient-x h-11 w-full rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 font-semibold text-emerald-950 shadow-lg shadow-emerald-500/30"
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
                        className="w-full text-emerald-100/80 hover:bg-white/10 hover:text-white"
                      >
                        <ChevronLeft className="size-4" />
                        {t.auth.changeEmail}
                      </Button>
                    </CardFooter>
                  </form>
                </>
              )}
              <div className="rounded-b-xl border-t border-white/10 bg-black/20 px-6 py-3.5 text-center text-xs text-emerald-100/60">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-emerald-300" />
                  {t.auth.secured}
                </span>
              </div>
            </Card>
          </motion.div>
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
