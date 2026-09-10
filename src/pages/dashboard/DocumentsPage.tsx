import { useRef, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  FileText,
  Landmark,
  Loader2,
  ScanLine,
  Trash2,
  Upload,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

const DOC_TYPES = [
  { type: "aadhaar", icon: ScanLine, key: "aadhaar" },
  { type: "pan", icon: FileText, key: "pan" },
  { type: "landRecord", icon: Landmark, key: "landRecord" },
  { type: "bankPassbook", icon: Wallet, key: "bankPassbook" },
] as const;

export default function DocumentsPage() {
  const { t } = useApp();
  const farmer = useQuery(api.farmers.getMyFarmer);
  const docs = useQuery(api.dashboard.getMyDocuments);
  const upload = useMutation(api.farmers.uploadDocument);
  const remove = useMutation(api.farmers.deleteDocument);
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pendingType = useRef<string | null>(null);

  const handleFilePick = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    const type = pendingType.current;
    e.target.value = "";
    if (!file || !type) return;
    setUploadingType(type);
    try {
      await upload({
        type,
        fileName: file.name,
        fileType: file.type || "application/octet-stream",
        fileSize: file.size,
      });
      toast.success(
        (t.docs[type as keyof typeof t.docs] as string) + " · " + t.docs.verified,
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingType(null);
    }
  };

  const openPicker = (type: string) => {
    if (!farmer) {
      toast.error(t.home.notRegistered);
      return;
    }
    pendingType.current = type;
    fileInputRef.current?.click();
  };

  const handleDelete = async (id: string) => {
    try {
      await remove({ documentId: id as never });
      toast.success(t.docs.delete);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  const statusBadge = (status: string) =>
    status === "verified" ? (
      <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
        <CheckCircle2 className="mr-1 size-3" />
        {t.docs.verified}
      </Badge>
    ) : status === "processing" ? (
      <Badge variant="secondary">{t.docs.processing}</Badge>
    ) : (
      <Badge variant="destructive">{t.docs.rejected}</Badge>
    );

  return (
    <div className="space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*,.pdf"
        onChange={handleFilePick}
      />

      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t.docs.title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          {t.docs.subtitle}
        </p>
      </div>

      {!farmer && (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            {t.home.notRegistered}
          </CardContent>
        </Card>
      )}

      {farmer && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {DOC_TYPES.map((d) => {
              const existing = docs?.find((x) => x.type === d.type);
              const isUploading = uploadingType === d.type;
              return (
                <Card key={d.type} className="relative overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <d.icon className="size-5" />
                      </div>
                      {existing && statusBadge(existing.status)}
                    </div>
                    <CardTitle className="text-base">
                      {t.docs[d.key]}
                    </CardTitle>
                    {existing && (
                      <CardDescription className="truncate">
                        {existing.fileName}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {existing?.extractedFields && (
                      <div className="rounded-lg bg-muted/60 p-3 text-xs space-y-1">
                        <div className="flex justify-between gap-2">
                          <span className="text-muted-foreground">
                            {t.docs.idNumber}
                          </span>
                          <span className="font-mono font-semibold">
                            {existing.extractedFields.idNumber}
                          </span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-muted-foreground">
                            {t.docs.holder}
                          </span>
                          <span className="font-semibold">
                            {existing.extractedFields.holderName}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={existing ? "outline" : "default"}
                        className="flex-1"
                        onClick={() => openPicker(d.type)}
                        disabled={uploadingType !== null}
                      >
                        {isUploading ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Upload className="size-4" />
                        )}
                        {existing ? t.docs.upload : t.docs.upload}
                      </Button>
                      {existing && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(existing._id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ScanLine className="size-4 text-primary" />
                  {t.docs.uploaded}
                </CardTitle>
                <CardDescription>{t.docs.ocrNote}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {docs?.length === 0 && (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    {t.docs.none}
                  </p>
                )}
                {(docs ?? []).map((doc) => (
                  <div
                    key={doc._id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {t.docs[doc.type as keyof typeof t.docs] as string}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {doc.fileName} · {(doc.fileSize / 1024).toFixed(0)} KB
                      </div>
                    </div>
                    {statusBadge(doc.status)}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-base">{t.profile.verification}</CardTitle>
                <CardDescription>
                  {farmer.verificationStatus === "verified"
                    ? t.home.verifiedBody
                    : t.home.verificationPendingBody}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                    <CheckCircle2 className="size-6" />
                  </div>
                  <div>
                    <div className="font-semibold">
                      {farmer.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {farmer.village}, {farmer.district}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

    </div>
  );
}
