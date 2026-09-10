import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useApp } from "@/lib/i18n";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, UserPen } from "lucide-react";
import { useNavigate } from "react-router";

const STATES = [
  "Uttar Pradesh",
  "Madhya Pradesh",
  "Bihar",
  "Rajasthan",
  "Maharashtra",
  "Punjab",
  "Haryana",
  "Chhattisgarh",
  "Gujarat",
  "Odisha",
  "Jharkhand",
  "Uttarakhand",
];

export default function RegisterPage() {
  const { t } = useApp();
  const navigate = useNavigate();
  const farmer = useQuery(api.farmers.getMyFarmer);
  const register = useMutation(api.farmers.registerFarmer);
  const update = useMutation(api.farmers.updateMyFarmer);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    village: "",
    district: "Jhansi",
    state: "Uttar Pradesh",
    landSizeAcres: "2.5",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (farmer) {
      setForm({
        name: farmer.name,
        phone: farmer.phone,
        village: farmer.village,
        district: farmer.district,
        state: farmer.state,
        landSizeAcres: String(farmer.landSizeAcres),
      });
    }
  }, [farmer]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        village: form.village.trim(),
        district: form.district.trim(),
        state: form.state,
        landSizeAcres: Number(form.landSizeAcres) || 0,
      };
      if (!payload.name || !payload.phone || !payload.village) {
        toast.error("Please fill name, mobile and village");
        setSaving(false);
        return;
      }
      if (farmer) {
        await update(payload);
        toast.success(t.register.updateSaved);
      } else {
        await register(payload);
        toast.success(t.register.saved);
        navigate("/dashboard/documents");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const field =
    "mt-1.5 block w-full rounded-lg border bg-card px-3 py-2 text-sm shadow-sm outline-none ring-primary focus:ring-2 disabled:opacity-60";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {farmer ? t.register.editProfile : t.register.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t.register.subtitle}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <UserPen className="size-5" />
          </div>
          <CardTitle className="text-base">{t.profile.personal}</CardTitle>
          <CardDescription>
            {farmer
              ? t.profile.verification +
                ": " +
                (farmer.verificationStatus === "verified"
                  ? t.docs.verified
                  : t.docs.processing)
              : t.register.subtitle}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="name">{t.register.name}</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={t.register.name}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">{t.register.phone}</Label>
              <Input
                id="phone"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]{10}"
                title="10-digit mobile number"
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })
                }
                placeholder="9876543210"
                required
              />
  </div>
            <div>
              <Label htmlFor="village">{t.register.village}</Label>
              <Input
                id="village"
                value={form.village}
                onChange={(e) => setForm({ ...form, village: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="district">{t.register.district}</Label>
              <Input
                id="district"
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="state">{t.register.state}</Label>
              <select
                id="state"
                className={field}
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              >
                {STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="land">{t.register.land}</Label>
              <Input
                id="land"
                type="number"
                min="0"
                step="0.1"
                value={form.landSizeAcres}
                onChange={(e) =>
                  setForm({ ...form, landSizeAcres: e.target.value })
                }
                required
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                {saving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  t.register.save
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
