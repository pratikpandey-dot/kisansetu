import { useApp } from "@/lib/i18n";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Languages, Moon, Sun } from "lucide-react";

/** Language switcher + theme toggle used on the landing page and app header. */
export function LangThemeControls({ solid = false }: { solid?: boolean }) {
  const { lang, setLang, theme, setTheme } = useApp();
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex items-center gap-1 rounded-full border p-1 ${
          solid
            ? "border-border bg-card"
            : "border-white/20 bg-white/10 backdrop-blur"
        }`}
      >
        <Languages
          className={`ml-1.5 size-3.5 ${solid ? "text-muted-foreground" : "text-white/80"}`}
        />
        {(["en", "hi"] as const).map((code) => (
          <button
            key={code}
            onClick={() => setLang(code)}
            className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
              lang === code
                ? solid
                  ? "bg-primary text-primary-foreground"
                  : "bg-white text-emerald-900"
                : solid
                  ? "text-muted-foreground hover:text-foreground"
                  : "text-white/70 hover:text-white"
            }`}
          >
            {code === "en" ? "EN" : "हिं"}
          </button>
        ))}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className={`size-8 rounded-full ${solid ? "" : "text-white hover:bg-white/15 hover:text-white"}`}
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        aria-label="Toggle theme"
      >
        {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </Button>
    </div>
  );
}
