import { useAuth } from "@/hooks/use-auth";
import { useApp, LANGS } from "@/lib/i18n";
import { KisanMitra } from "@/components/KisanMitra";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Logo } from "@/components/Logo";
import {
  CalendarClock,
  FileCheck2,
  Home,
  Info,
  LifeBuoy,
  LogOut,
  Menu,
  Moon,
  Receipt,
  Scale,
  Settings,
  Sparkles,
  Sun,
  Tags,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Accessibility } from "lucide-react";

const NAV = [
  { to: "/dashboard", key: "home", icon: Home },
  { to: "/dashboard/insights", key: "insights", icon: Sparkles },
  { to: "/dashboard/register", key: "register", icon: User },
  { to: "/dashboard/documents", key: "documents", icon: FileCheck2 },
  { to: "/dashboard/book", key: "bookSlot", icon: CalendarClock },
  { to: "/dashboard/queue", key: "queue", icon: Scale },
  { to: "/dashboard/prices", key: "prices", icon: Tags },
  { to: "/dashboard/history", key: "history", icon: Receipt },
  { to: "/dashboard/support", key: "support", icon: LifeBuoy },
] as const;

export function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, signOut } = useAuth();
  const { t, lang, setLang, theme, setTheme, easyMode, setEasyMode } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const displayName =
    user?.name ||
    user?.email?.split("@")[0] ||
    (lang === "hi" ? "किसान" : "Farmer");

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const navItems = NAV.map((item) => ({
    ...item,
    label: t.nav[item.key as keyof typeof t.nav],
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/40 via-background to-background">
      {/* ---------- top bar ---------- */}
      <header className="sticky top-0 z-40 border-b bg-gradient-to-r from-emerald-800 via-emerald-900 to-teal-900 text-white shadow-lg shadow-emerald-950/10 backdrop-blur">
        <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/15 hover:text-white lg:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <Logo className="size-9 rounded-lg shadow-md shadow-emerald-950/30" />
              <div className="hidden leading-tight sm:block">
                <span className="block text-sm font-bold text-white">{t.brand}</span>
                <span className="block text-[10px] uppercase tracking-widest text-emerald-200/80">
                  {t.common.dashboard}
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-1.5">
            {/* all-language quick chips (digital divide: switch anytime) */}
            <div className="hidden items-center gap-0.5 rounded-full border border-white/20 bg-white/10 p-0.5 md:flex">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={cn(
                    "rounded-full px-2 py-1 text-xs font-semibold transition-colors",
                    lang === l.code
                      ? "bg-white text-emerald-900 shadow-sm"
                      : "text-emerald-100/90 hover:bg-white/15 hover:text-white",
                  )}
                  title={l.label}
                >
                  {l.short}
                </button>
              ))}
            </div>
            {/* compact language chip on small screens */}
            <button
              onClick={() => {
                const idx = LANGS.findIndex((l) => l.code === lang);
                setLang(LANGS[(idx + 1) % LANGS.length].code);
              }}
              className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 md:hidden"
              title={t.settings.language}
            >
              {LANGS.find((l) => l.code === lang)?.short ?? "EN"}
            </button>
            <button
              onClick={() => setEasyMode(!easyMode)}
              className={cn(
                "rounded-full border border-white/25 p-2 transition-colors hover:bg-white/15",
                easyMode
                  ? "border-amber-300/60 bg-amber-300/25 text-amber-100"
                  : "text-white",
              )}
              aria-label={t.easy.enable}
              title={t.easy.enable}
            >
              <Accessibility className="size-4" />
            </button>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full border border-white/25 p-2 text-white hover:bg-white/15"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="ml-1 flex items-center gap-2 rounded-full border border-white/25 bg-white/10 py-1 pl-1 pr-2.5 text-white hover:bg-white/20">
                  <Avatar className="size-7">
                    <AvatarFallback className="bg-emerald-300 text-xs font-bold text-emerald-950">
                      {displayName.slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-28 truncate text-sm font-medium sm:block">
                    {displayName}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">
                  {displayName}
                  <div className="truncate text-xs font-normal text-muted-foreground">
                    {user?.email}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/dashboard/profile")}>
                  <User className="size-4" /> {t.nav.profile}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/dashboard/settings")}>
                  <Settings className="size-4" /> {t.nav.settings}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/dashboard/about")}>
                  <Info className="size-4" /> {t.nav.about}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="size-4" /> {t.nav.logout}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* ---------- desktop nav ---------- */}
        <nav className="hidden border-t border-white/10 bg-emerald-950/40 lg:block">
          <div className="flex items-center gap-1 overflow-x-auto px-4 sm:px-6">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/dashboard"}
                className={({ isActive }) =>
                  `flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "border-amber-300 text-amber-200"
                      : "border-transparent text-emerald-100/70 hover:text-white"
                  }`
                }
              >
                <item.icon className="size-4" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* ---------- mobile drawer ---------- */}
        {mobileOpen && (
          <div className="border-t border-white/10 bg-emerald-900 text-white lg:hidden">
            <nav className="grid gap-1 p-3">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/dashboard"}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                      isActive
                        ? "bg-white/15 text-white"
                        : "text-emerald-100/80 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  <item.icon className="size-4" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </main>

      <KisanMitra />

      <footer className="border-t py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <span>
            © {new Date().getFullYear()} {t.brand} · {t.landing.footerNote}
          </span>
          <span>
            {t.support.helpline}: <strong>1800-180-1551</strong>
          </span>
        </div>
      </footer>
    </div>
  );
}
