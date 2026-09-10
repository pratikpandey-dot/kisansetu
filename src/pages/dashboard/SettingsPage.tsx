import { useApp } from "@/lib/i18n";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Globe, Info, Moon, Sun } from "lucide-react";
import logo from "@/assets/logo.svg";

export default function SettingsPage() {
  const { t, lang, setLang, theme, setTheme } = useApp();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t.settings.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t.settings.subtitle}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="size-4 text-primary" />
            {t.settings.language}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-xl border p-4">
            <div>
              <Label className="text-sm">English</Label>
              <p className="text-xs text-muted-foreground">
                Read the app in English
              </p>
            </div>
            <Switch
              checked={lang === "en"}
              onCheckedChange={(v) => setLang(v ? "en" : "hi")}
            />
          </div>
          <div className="mt-3 flex items-center justify-between rounded-xl border p-4">
            <div>
              <Label className="text-sm">हिंदी (Hindi)</Label>
              <p className="text-xs text-muted-foreground">
                ऐप को हिंदी में पढ़ें
              </p>
            </div>
            <Switch
              checked={lang === "hi"}
              onCheckedChange={(v) => setLang(v ? "hi" : "en")}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            {theme === "dark" ? (
              <Moon className="size-4 text-primary" />
            ) : (
              <Sun className="size-4 text-primary" />
            )}
            {t.settings.theme}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-xl border p-4">
            <div>
              <Label className="text-sm">
                {theme === "dark" ? t.settings.dark : t.settings.light}
              </Label>
              <p className="text-xs text-muted-foreground">
                {t.settings.light} / {t.settings.dark}
              </p>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(v) => setTheme(v ? "dark" : "light")}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <img src={logo} alt="" className="size-10 rounded-lg" />
            <CardTitle className="flex items-center gap-2 text-base">
              <Info className="size-4 text-primary" />
              {t.settings.about}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-sm leading-relaxed">
            {t.settings.aboutBody}
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
