import { useAuth } from "@/hooks/use-auth";
import { useApp, type Lang } from "@/lib/i18n";
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
  BookSlotIcon,
  FileCheck2,
  History,
  Home,
  Info,
  LifeBuoy,
  LogOut,
  Menu,
  Receipt,
  Scale,
  Settings,
  Tags,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";

const NAV = [
  { to: "/dashboard", key: "home", icon: Home },
  { to: "/dashboard/register", key: "register", icon: User },
  { to: "/dashboard/documents", key: "documents", icon: FileCheck2 },
  { to: "/dashboard/book", key: "bookSlot", icon: BookSlotIcon },
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
  const { t, lang, setLang, theme, setTheme } = useApp();
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-background">
      {/* ---------- top bar ---------- */}
      <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur">
        <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <Logo className="size-9 rounded-lg" />
              <div className="hidden leading-tight sm:block">
                <span className="block text-sm font-bold">{t.brand}</span>
                <span className="block text-[10px] uppercase tracking-widest text-muted-foreground">
                  {t.common.dashboard}
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setLang(lang === "en" ? "hi" : "en")}
              className="rounded-full border px-3 py-1.5 text-xs font-semibold hover:bg-accent"
              title="EN / हिंदी"
            >
              {lang === "en" ? "EN" : "हिं"}
            </button>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full border p-2 hover:bg-accent"
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
                <button className="ml-1 flex items-center gap-2 rounded-full border py-1 pl-1 pr-2.5 hover:bg-accent">
                  <Avatar className="size-7">
                    <AvatarFallback className="bg-primary/15 text-xs font-bold text-primary">
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
        <nav className="hidden border-t lg:block">
          <div className="flex items-center gap-1 overflow-x-auto px-4 sm:px-6">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/dashboard"}
                className={({ isActive }) =>
                  `flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
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
          <div className="border-t bg-card lg:hidden">
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
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
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
        {children}
      </main>

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
