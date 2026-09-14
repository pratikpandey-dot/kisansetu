import { useEffect, useRef, useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useApp, localeOf } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  Mic,
  MicOff,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

interface Msg {
  role: "user" | "assistant";
  content: string;
  online?: boolean;
}

/* ------------------------- Web Speech types ------------------------- */

interface SRResult {
  isFinal: boolean;
  0: { transcript: string };
  length: number;
}
interface SREvent extends Event {
  resultIndex: number;
  results: { length: number; [i: number]: SRResult };
}
interface SRInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: SREvent) => void) | null;
  onerror: ((e: Event) => void) | null;
  onend: (() => void) | null;
}
type SRCtor = new () => SRInstance;

function getSpeechRecognition(): SRCtor | null {
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as SRCtor | null;
}

export function KisanMitra() {
  const { t, lang, easyMode } = useApp();
  const askMitra = useAction(api.ai.askMitra);

  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [speakOn, setSpeakOn] = useState(false);
  const recRef = useRef<SRInstance | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  const speak = (text: string) => {
    if (!speakOn || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = localeOf(lang);
    u.rate = easyMode ? 0.9 : 1;
    window.speechSynthesis.speak(u);
  };

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, open]);

  // Seed the greeting once when first opened.
  useEffect(() => {
    if (open && !started.current) {
      started.current = true;
      setMsgs([{ role: "assistant", content: t.chat.greeting }]);
    }
  }, [open, t.chat.greeting]);

  const ask = async (question: string) => {
    const q = question.trim();
    if (!q || busy) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", content: q }]);
    setBusy(true);
    try {
      const res = await askMitra({ question: q, lang });
      const answer = res.answer;
      setMsgs((m) => [...m, { role: "assistant", content: answer, online: res.online }]);
      speak(answer);
    } catch {
      toast.error(t.chat.error);
    } finally {
      setBusy(false);
    }
  };

  const toggleMic = () => {
    const SR = getSpeechRecognition();
    if (!SR) {
      toast.error(t.chat.micBlocked);
      return;
    }
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const rec = new SR();
    rec.lang = localeOf(lang);
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e) => {
      const text = e.results[e.resultIndex]?.[0]?.transcript ?? "";
      if (text) void ask(text);
    };
    rec.onerror = () => {
      setListening(false);
      toast.error(t.chat.micBlocked);
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    rec.start();
  };

  return (
    <>
      {/* floating launcher — gradient + pulse ring */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="mitra-fab"
            initial={{ opacity: 0, scale: 0.6, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 16 }}
            transition={{ type: "spring", stiffness: 320, damping: 20 }}
            onClick={() => setOpen(true)}
            className="fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 py-3 pr-5 pl-4 font-semibold text-white shadow-xl shadow-emerald-500/35 transition-shadow hover:shadow-2xl hover:shadow-emerald-500/45"
          >
            <span className="animate-pulse-ring absolute inset-0 rounded-full" />
            <Sparkles className="relative size-5" />
            <span className="relative">{t.chat.open}</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mitra-panel"
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className={cn(
              "bg-background fixed right-3 bottom-3 z-50 flex w-[calc(100vw-1.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border shadow-2xl",
              easyMode && "text-lg",
            )}
          >
            {/* header */}
            <div className="flex items-center justify-between gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-white">
            <div className="flex min-w-0 items-center gap-2.5">
              <Logo className="size-8 shrink-0 rounded-lg" />
              <div className="min-w-0 leading-tight">
                <div className="truncate text-sm font-bold">{t.chat.title}</div>
                <div className="truncate text-[10px] opacity-90">
                  {t.chat.subtitle}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSpeakOn((v) => !v)}
                className="rounded-full p-1.5 transition-colors hover:bg-white/20"
                aria-label={t.chat.readAloud}
                title={t.chat.readAloud}
              >
                {speakOn ? (
                  <Volume2 className="size-4" />
                ) : (
                  <VolumeX className="size-4" />
                )}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 transition-colors hover:bg-white/20"
                aria-label={t.common.close}
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* messages */}
          <div className="max-h-80 min-h-40 flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {msgs.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-wrap",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground ml-auto"
                    : "bg-muted",
                )}
              >
                {m.content}
                {m.role === "assistant" && m.online === false && (
                  <span className="mt-1.5 block text-[10px] text-muted-foreground">
                    · {t.chat.offline}
                  </span>
                )}
              </div>
            ))}
            {busy && (
              <div className="bg-muted inline-flex max-w-[85%] items-center gap-2 rounded-2xl px-3.5 py-2.5 text-sm">
                <span className="flex gap-1">
                  <span className="bg-primary size-1.5 animate-bounce rounded-full [animation-delay:0ms]" />
                  <span className="bg-primary size-1.5 animate-bounce rounded-full [animation-delay:150ms]" />
                  <span className="bg-primary size-1.5 animate-bounce rounded-full [animation-delay:300ms]" />
                </span>
                {t.chat.thinking}
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* quick questions */}
          <div className="flex flex-wrap gap-1.5 px-4 pb-2">
            {[t.chat.q1, t.chat.q2, t.chat.q3, t.chat.q4].map((q) => (
              <button
                key={q}
                onClick={() => void ask(q)}
                disabled={busy}
                className="bg-secondary hover:bg-accent rounded-full px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* input row */}
          <div className="border-t p-3">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void ask(input);
                }}
                placeholder={listening ? t.chat.listening : t.chat.placeholder}
                className="bg-background h-11 min-w-0 flex-1 rounded-full border px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              />
              <Button
                size="icon"
                variant={listening ? "destructive" : "secondary"}
                className="size-11 shrink-0 rounded-full"
                onClick={toggleMic}
                aria-label={t.chat.title}
              >
                {listening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
              </Button>
              <Button
                size="icon"
                className="size-11 shrink-0 rounded-full"
                onClick={() => void ask(input)}
                disabled={busy || !input.trim()}
                aria-label={t.chat.send}
              >
                <Send className="size-4" />
              </Button>
            </div>
            <p className="mt-2 text-center text-[10px] leading-tight text-muted-foreground">
              {t.chat.aiNote}
            </p>
          </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
